const prisma = require('../config/db');

/**
 * GET /api/services
 */
async function getServices(req, res, next) {
  try {
    const services = await prisma.service.findMany({
      include: {
        checklistItems: true,
        _count: { select: { cases: true } }
      },
      orderBy: { name: 'asc' }
    });

    return res.status(200).json({ success: true, count: services.length, services });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/services/:id
 */
async function getServiceById(req, res, next) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: { checklistItems: true }
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    return res.status(200).json({ success: true, service });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/services
 */
async function createService(req, res, next) {
  try {
    const { name, description, category, defaultFee, renewalPeriodMonths, isActive, checklistItems } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Service name is required.' });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        category: category || 'General Compliance',
        defaultFee: Number(defaultFee) || 0,
        renewalPeriodMonths: Number(renewalPeriodMonths) || 12,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        checklistItems: {
          create: (checklistItems || []).map(item => ({
            name: item.name,
            description: item.description,
            isRequired: item.isRequired !== undefined ? item.isRequired : true
          }))
        }
      },
      include: { checklistItems: true }
    });

    return res.status(201).json({ success: true, message: 'Service created successfully.', service });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/services/:id
 */
async function updateService(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, category, defaultFee, renewalPeriodMonths, isActive } = req.body;

    const existingService = await prisma.service.findUnique({ where: { id } });
    if (!existingService) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        category,
        defaultFee: defaultFee !== undefined ? Number(defaultFee) : undefined,
        renewalPeriodMonths: renewalPeriodMonths !== undefined ? Number(renewalPeriodMonths) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined
      },
      include: { checklistItems: true }
    });

    return res.status(200).json({ success: true, message: 'Service updated successfully.', service: updatedService });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/services/:id/checklist
 * Add new checklist template item to a service
 */
async function addChecklistItem(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, isRequired } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Checklist item name is required.' });
    }

    const item = await prisma.documentChecklistItem.create({
      data: {
        serviceId: id,
        name,
        description,
        isRequired: isRequired !== undefined ? Boolean(isRequired) : true
      }
    });

    return res.status(201).json({ success: true, message: 'Checklist item added successfully.', item });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  addChecklistItem
};
