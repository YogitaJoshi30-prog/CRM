const prisma = require('../config/db');

/**
 * GET /api/leads
 */
async function getLeads(req, res, next) {
  try {
    const { status, search } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedStaff: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, name: true } },
        convertedClient: { select: { id: true, companyName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, count: leads.length, leads });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/leads/:id
 */
async function getLeadById(req, res, next) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        assignedStaff: { select: { id: true, name: true, email: true } },
        service: true,
        convertedClient: true
      }
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    return res.status(200).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/leads
 */
async function createLead(req, res, next) {
  try {
    const { name, companyName, email, phone, source, serviceId, description, assignedStaffId, notes } = req.body;

    if (!name || !companyName || !email) {
      return res.status(400).json({ success: false, message: 'Lead name, company name, and email are required.' });
    }

    let serviceName = null;
    if (serviceId) {
      const svc = await prisma.service.findUnique({ where: { id: serviceId } });
      if (svc) serviceName = svc.name;
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        companyName,
        email: email.toLowerCase().trim(),
        phone,
        source: source || 'Direct Web',
        serviceId,
        serviceName,
        description,
        assignedStaffId,
        notes,
        status: 'NEW'
      },
      include: {
        assignedStaff: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } }
      }
    });

    // Record activity log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'LEAD_CREATED',
        entity: 'Lead',
        entityId: lead.id,
        metadata: JSON.stringify({ companyName: lead.companyName, email: lead.email })
      }
    });

    return res.status(201).json({ success: true, message: 'Lead created successfully.', lead });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/leads/:id
 */
async function updateLead(req, res, next) {
  try {
    const { id } = req.params;
    const { name, companyName, email, phone, source, serviceId, description, assignedStaffId, status, notes } = req.body;

    const existingLead = await prisma.lead.findUnique({ where: { id } });
    if (!existingLead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    let serviceName = existingLead.serviceName;
    if (serviceId && serviceId !== existingLead.serviceId) {
      const svc = await prisma.service.findUnique({ where: { id: serviceId } });
      if (svc) serviceName = svc.name;
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        name,
        companyName,
        email: email ? email.toLowerCase().trim() : undefined,
        phone,
        source,
        serviceId,
        serviceName,
        description,
        assignedStaffId,
        status,
        notes
      },
      include: {
        assignedStaff: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } }
      }
    });

    // Record activity log if status changed
    if (status && status !== existingLead.status) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'LEAD_STATUS_CHANGED',
          entity: 'Lead',
          entityId: updatedLead.id,
          metadata: JSON.stringify({ from: existingLead.status, to: status })
        }
      });
    }

    return res.status(200).json({ success: true, message: 'Lead updated successfully.', lead: updatedLead });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/leads/:id
 */
async function deleteLead(req, res, next) {
  try {
    const { id } = req.params;

    const existingLead = await prisma.lead.findUnique({ where: { id } });
    if (!existingLead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    await prisma.lead.delete({ where: { id } });

    return res.status(200).json({ success: true, message: 'Lead deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/leads/:id/convert
 * Transactional conversion of Lead -> Client
 */
async function convertLeadToClient(req, res, next) {
  try {
    const { id } = req.params;
    const { gstin, pan, address, city, state, industry } = req.body;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    if (lead.convertedClientId) {
      return res.status(400).json({ success: false, message: 'Lead has already been converted to a Client.' });
    }

    // Database Transaction to guarantee integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if client with matching companyName or email exists
      let client = await tx.client.findFirst({
        where: {
          OR: [
            { email: lead.email },
            { companyName: lead.companyName }
          ]
        }
      });

      // 2. Create client record if not existing
      if (!client) {
        client = await tx.client.create({
          data: {
            companyName: lead.companyName,
            contactPerson: lead.name,
            email: lead.email,
            phone: lead.phone,
            gstin: gstin || null,
            pan: pan || null,
            address: address || null,
            city: city || 'Mumbai',
            state: state || 'Maharashtra',
            country: 'India',
            industry: industry || 'Compliance Services',
            status: 'ACTIVE'
          }
        });
      }

      // 3. Update lead to WON status and link convertedClientId
      const updatedLead = await tx.lead.update({
        where: { id: lead.id },
        data: {
          status: 'WON',
          convertedClientId: client.id
        }
      });

      // 4. Record Activity Log
      await tx.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'LEAD_CONVERTED',
          entity: 'Lead',
          entityId: lead.id,
          metadata: JSON.stringify({ clientId: client.id, companyName: client.companyName })
        }
      });

      return { client, lead: updatedLead };
    });

    return res.status(200).json({
      success: true,
      message: 'Lead converted to Client successfully!',
      client: result.client,
      lead: result.lead
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  convertLeadToClient
};
