const prisma = require('../config/db');

/**
 * GET /api/clients
 */
async function getClients(req, res, next) {
  try {
    const { status, search } = req.query;

    const where = {};

    // Strict Client Data Isolation
    if (req.user.role === 'CLIENT') {
      where.id = req.clientId;
    } else {
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { companyName: { contains: search, mode: 'insensitive' } },
          { contactPerson: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { gstin: { contains: search, mode: 'insensitive' } },
          { pan: { contains: search, mode: 'insensitive' } }
        ];
      }
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        _count: { select: { cases: true } },
        user: { select: { id: true, email: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, count: clients.length, clients });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/clients/:id
 */
async function getClientById(req, res, next) {
  try {
    const { id } = req.params;

    // Strict Client Data Isolation
    if (req.user.role === 'CLIENT' && id !== req.clientId) {
      return res.status(403).json({ success: false, message: 'Access denied to other clients data.' });
    }

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        cases: {
          include: {
            service: { select: { name: true, category: true } },
            assignedStaff: { select: { name: true, email: true } },
            _count: { select: { documents: true, payments: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    return res.status(200).json({ success: true, client });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/clients
 */
async function createClient(req, res, next) {
  try {
    const { companyName, contactPerson, email, phone, address, city, state, country, gstin, pan, industry, status } = req.body;

    if (!companyName || !contactPerson || !email) {
      return res.status(400).json({ success: false, message: 'Company name, contact person, and email are required.' });
    }

    const existingClient = await prisma.client.findFirst({
      where: { OR: [{ email: email.toLowerCase().trim() }, { companyName }] }
    });

    if (existingClient) {
      return res.status(400).json({ success: false, message: 'Client with this email or company name already exists.' });
    }

    const client = await prisma.client.create({
      data: {
        companyName,
        contactPerson,
        email: email.toLowerCase().trim(),
        phone,
        address,
        city,
        state,
        country: country || 'India',
        gstin,
        pan,
        industry,
        status: status || 'ONBOARDING'
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'CLIENT_CREATED',
        entity: 'Client',
        entityId: client.id,
        metadata: JSON.stringify({ companyName: client.companyName })
      }
    });

    return res.status(201).json({ success: true, message: 'Client created successfully.', client });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/clients/:id
 */
async function updateClient(req, res, next) {
  try {
    const { id } = req.params;

    if (req.user.role === 'CLIENT' && id !== req.clientId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const existingClient = await prisma.client.findUnique({ where: { id } });
    if (!existingClient) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    const { companyName, contactPerson, email, phone, address, city, state, country, gstin, pan, industry, status } = req.body;

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        companyName,
        contactPerson,
        email: email ? email.toLowerCase().trim() : undefined,
        phone,
        address,
        city,
        state,
        country,
        gstin,
        pan,
        industry,
        status
      }
    });

    return res.status(200).json({ success: true, message: 'Client updated successfully.', client: updatedClient });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient
};
