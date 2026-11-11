// Prisma Seed Script for Drisu Compliance Operations Portal (JavaScript)
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Drisu Compliance Portal Database Seeding...');

  // 1. Clean existing records (Optional safety reset)
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.caseComment.deleteMany();
  await prisma.renewal.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.caseDocument.deleteMany();
  await prisma.case.deleteMany();
  await prisma.documentChecklistItem.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.client.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database tables');

  // Password hash for demo users: "Demo@123456"
  const passwordHash = await bcrypt.hash('Demo@123456', 10);

  // 2. Create System Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma (Admin)',
      email: 'admin@drisu-demo.local',
      password: passwordHash,
      role: 'ADMIN',
      phone: '+91 98765 43210'
    }
  });

  const manager1 = await prisma.user.create({
    data: {
      name: 'Ananya Verma (Operations Manager)',
      email: 'manager@drisu-demo.local',
      password: passwordHash,
      role: 'MANAGER',
      phone: '+91 98765 43211'
    }
  });

  const manager2 = await prisma.user.create({
    data: {
      name: 'Siddharth Mehta (Audit Lead)',
      email: 'manager2@drisu-demo.local',
      password: passwordHash,
      role: 'MANAGER',
      phone: '+91 98765 43212'
    }
  });

  const staff1 = await prisma.user.create({
    data: {
      name: 'Priya Nair (Senior Compliance Executive)',
      email: 'staff1@drisu-demo.local',
      password: passwordHash,
      role: 'STAFF',
      phone: '+91 98765 43213'
    }
  });

  const staff2 = await prisma.user.create({
    data: {
      name: 'Amit Patel (Document Verifier)',
      email: 'staff2@drisu-demo.local',
      password: passwordHash,
      role: 'STAFF',
      phone: '+91 98765 43214'
    }
  });

  const staff3 = await prisma.user.create({
    data: {
      name: 'Vikram Joshi (EPR Specialist)',
      email: 'staff3@drisu-demo.local',
      password: passwordHash,
      role: 'STAFF',
      phone: '+91 98765 43215'
    }
  });

  const staff4 = await prisma.user.create({
    data: {
      name: 'Neha Kapoor (GST Lead)',
      email: 'staff4@drisu-demo.local',
      password: passwordHash,
      role: 'STAFF',
      phone: '+91 98765 43216'
    }
  });

  const staff5 = await prisma.user.create({
    data: {
      name: 'Karan Gupta (ISO Lead Auditor)',
      email: 'staff5@drisu-demo.local',
      password: passwordHash,
      role: 'STAFF',
      phone: '+91 98765 43217'
    }
  });

  // Client Users
  const clientUser1 = await prisma.user.create({
    data: {
      name: 'Sunil Rao (Apex Mfg Director)',
      email: 'client1@drisu-demo.local',
      password: passwordHash,
      role: 'CLIENT',
      phone: '+91 91234 56789'
    }
  });

  const clientUser2 = await prisma.user.create({
    data: {
      name: 'Kavita Reddy (GreenCore Ops)',
      email: 'client2@drisu-demo.local',
      password: passwordHash,
      role: 'CLIENT',
      phone: '+91 91234 56790'
    }
  });

  const clientUser3 = await prisma.user.create({
    data: {
      name: 'Rohan Deshmukh (Nova Textiles)',
      email: 'client3@drisu-demo.local',
      password: passwordHash,
      role: 'CLIENT',
      phone: '+91 91234 56791'
    }
  });

  console.log('✅ Created 11 Users (Admin, 2 Managers, 5 Staff, 3 Client Logins)');

  // 3. Create Compliance Services
  const iso9001Service = await prisma.service.create({
    data: {
      name: 'ISO 9001:2015 Certification',
      category: 'Quality Management Systems',
      description: 'Full audit and certification for ISO 9001 Quality Management Standards.',
      defaultFee: 50000.00,
      renewalPeriodMonths: 12,
      isActive: true,
      checklistItems: {
        create: [
          { name: 'Company Registration Certificate', description: 'CoI / Registration Deed of entity', isRequired: true },
          { name: 'PAN & GST Certificate', description: 'Copy of PAN and GST Registration', isRequired: true },
          { name: 'Organization Structure Chart', description: 'Hierarchical chart of key management', isRequired: true },
          { name: 'Quality Policy & Manual Draft', description: 'Existing quality guidelines or scope document', isRequired: false },
          { name: 'Utility Bill / Premises Proof', description: 'Electricity bill or lease agreement of registered facility', isRequired: true }
        ]
      }
    }
  });

  const eprService = await prisma.service.create({
    data: {
      name: 'EPR Registration & Annual Return',
      category: 'Environmental Compliance',
      description: 'Extended Producer Responsibility authorization for Plastic/E-Waste.',
      defaultFee: 75000.00,
      renewalPeriodMonths: 12,
      isActive: true,
      checklistItems: {
        create: [
          { name: 'Producer/Importer DIC/MSME Certificate', description: 'MSME or Udyam Registration', isRequired: true },
          { name: 'GST & IEC Certificate', description: 'Import Export Code if importing plastic/electronics', isRequired: true },
          { name: 'Flow Diagram of Plastic/E-Waste Handling', description: 'Detailed procurement and waste generation workflow', isRequired: true },
          { name: 'Pollution Control Board Consent (CTO/CTE)', description: 'State PCB Consent to Operate', isRequired: true },
          { name: 'Action Plan for EPR Targets', description: 'Waste collection target allocation sheet', isRequired: true }
        ]
      }
    }
  });

  const gstService = await prisma.service.create({
    data: {
      name: 'GST Quarterly & Annual Compliance',
      category: 'Taxation & Finance',
      description: 'Comprehensive GST filing, reconciliation, and audit representation.',
      defaultFee: 35000.00,
      renewalPeriodMonths: 12,
      isActive: true,
      checklistItems: {
        create: [
          { name: 'Monthly Sales & Purchase Registers', description: 'Excel or Tally data dump of invoices', isRequired: true },
          { name: 'Bank Statements', description: 'Bank statements covering the financial period', isRequired: true },
          { name: 'Input Tax Credit Reconciliation', description: 'GSTR-2B matching report', isRequired: true }
        ]
      }
    }
  });

  const iso14001Service = await prisma.service.create({
    data: {
      name: 'ISO 14001 Environmental System',
      category: 'Environmental Compliance',
      description: 'Environmental Management Certification and audit verification.',
      defaultFee: 65000.00,
      renewalPeriodMonths: 12,
      isActive: true,
      checklistItems: {
        create: [
          { name: 'Environmental Aspect-Impact Register', description: 'Detailed aspect impact matrix', isRequired: true },
          { name: 'Legal Compliance Matrix', description: 'Environmental laws applicability sheet', isRequired: true },
          { name: 'Waste Management Contract', description: 'MoU with authorized TSDF / Recycler', isRequired: true }
        ]
      }
    }
  });

  const trademarkService = await prisma.service.create({
    data: {
      name: 'Trademark & Brand Registration',
      category: 'Intellectual Property',
      description: 'Trademark search, class selection, filing, and objection clearance.',
      defaultFee: 25000.00,
      renewalPeriodMonths: 120,
      isActive: true,
      checklistItems: {
        create: [
          { name: 'Brand Logo & Mark Vector file', description: 'High resolution logo file', isRequired: true },
          { name: 'User Date Affidavit (if prior use)', description: 'Affidavit proving date of first commercial use', isRequired: false },
          { name: 'Form TM-48 Power of Attorney', description: 'Signed authorization for trademark agent', isRequired: true }
        ]
      }
    }
  });

  const factoryLicenseService = await prisma.service.create({
    data: {
      name: 'Factory License & Safety Audit',
      category: 'Industrial Safety',
      description: 'Factories Act compliance, building plan approval, and safety inspection.',
      defaultFee: 90000.00,
      renewalPeriodMonths: 12,
      isActive: true,
      checklistItems: {
        create: [
          { name: 'Approved Factory Building Plan', description: 'Sanctioned blueprint from DISH authority', isRequired: true },
          { name: 'NOC from Fire Department', description: 'Fire safety certificate', isRequired: true },
          { name: 'Machinery Layout & Horse Power Chart', description: 'Connected load details', isRequired: true }
        ]
      }
    }
  });

  console.log('✅ Created 6 Compliance Services with Document Checklists');

  // 4. Create Clients
  const client1 = await prisma.client.create({
    data: {
      companyName: 'Apex Manufacturing Pvt Ltd',
      contactPerson: 'Sunil Rao',
      email: 'contact@apex-mfg.com',
      phone: '+91 98220 11223',
      address: 'Plot 42, MIDC Industrial Area, Phase II',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      gstin: '27AAACA1234A1Z5',
      pan: 'AAACA1234A',
      industry: 'Precision Engineering',
      status: 'ACTIVE',
      userId: clientUser1.id
    }
  });

  const client2 = await prisma.client.create({
    data: {
      companyName: 'GreenCore Tech & Industries',
      contactPerson: 'Kavita Reddy',
      email: 'compliance@greencore.in',
      phone: '+91 98450 33445',
      address: '77 Electronics City, Hosur Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      gstin: '29BBBCC5678B1Z2',
      pan: 'BBBCC5678B',
      industry: 'E-Waste Recycling',
      status: 'ACTIVE',
      userId: clientUser2.id
    }
  });

  const client3 = await prisma.client.create({
    data: {
      companyName: 'Nova Textiles & Garments',
      contactPerson: 'Rohan Deshmukh',
      email: 'rohan@novatextiles.com',
      phone: '+91 98190 77889',
      address: 'GIDC Apparel Park, Sector 4',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      gstin: '24CCCDD9012C1Z9',
      pan: 'CCCDD9012C',
      industry: 'Textile Manufacturing',
      status: 'ACTIVE',
      userId: clientUser3.id
    }
  });

  const client4 = await prisma.client.create({
    data: {
      companyName: 'BluePeak Foods & Beverages',
      contactPerson: 'Deepak Sharma',
      email: 'info@bluepeakfoods.com',
      phone: '+91 98711 44556',
      address: 'Industrial Estate, Okhla Phase III',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      gstin: '07DDDEE3456D1Z1',
      pan: 'DDDEE3456D',
      industry: 'Food Processing',
      status: 'ACTIVE'
    }
  });

  const client5 = await prisma.client.create({
    data: {
      companyName: 'UrbanBuild Solutions Pvt Ltd',
      contactPerson: 'Meera Kapoor',
      email: 'meera@urbanbuild.in',
      phone: '+91 98300 88990',
      address: 'Salt Lake Sector V, Block EP',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      gstin: '19EEEFF7890E1Z8',
      pan: 'EEEFF7890E',
      industry: 'Infrastructure & Construction',
      status: 'ACTIVE'
    }
  });

  const client6 = await prisma.client.create({
    data: {
      companyName: 'TechNova Systems Solutions',
      contactPerson: 'Arjun Singhania',
      email: 'arjun@technova.io',
      phone: '+91 99800 22334',
      address: 'HITEC City, Phase II',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      gstin: '36FFFGG1234F1Z3',
      pan: 'FFFGG1234F',
      industry: 'IT & Cloud Hardware',
      status: 'ACTIVE'
    }
  });

  const client7 = await prisma.client.create({
    data: {
      companyName: 'Prime Packaging Pvt Ltd',
      contactPerson: 'Sanjay Dutt',
      email: 'sanjay@primepack.com',
      phone: '+91 97654 11223',
      address: 'Chakan Industrial Zone',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      gstin: '27GGGHH5678G1Z7',
      pan: 'GGGHH5678G',
      industry: 'Polymer Packaging',
      status: 'ONBOARDING'
    }
  });

  const client8 = await prisma.client.create({
    data: {
      companyName: 'EcoSphere Bio Products',
      contactPerson: 'Ankita Sen',
      email: 'ankita@ecosphere.org',
      phone: '+91 94330 66778',
      address: 'Peenya Industrial Estate 3rd Stage',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      gstin: '29HHHII9012H1Z4',
      pan: 'HHHII9012H',
      industry: 'Biopolymers',
      status: 'ACTIVE'
    }
  });

  console.log('✅ Created 8 Fictional Corporate Clients');

  // 5. Create Leads
  const leadsData = [
    {
      name: 'Vikas Agarwal',
      companyName: 'Agarwal Chemicals Pvt Ltd',
      email: 'vikas@agarwalchem.com',
      phone: '+91 98990 12345',
      source: 'Website Inquiry',
      serviceId: iso9001Service.id,
      serviceName: 'ISO 9001:2015 Certification',
      description: 'Looking to get ISO 9001 certification for export tender eligibility.',
      assignedStaffId: staff1.id,
      status: 'PROPOSAL',
      notes: 'Sent quotation of ₹50,000. Awaiting management review.'
    },
    {
      name: 'Pooja Hegde',
      companyName: 'Deccan Polymers',
      email: 'pooja@deccanpoly.in',
      phone: '+91 98480 98765',
      source: 'Referral',
      serviceId: eprService.id,
      serviceName: 'EPR Registration & Annual Return',
      description: 'Plastic waste producer target allocation for FY 2026-27.',
      assignedStaffId: staff3.id,
      status: 'NEW',
      notes: 'Initial call scheduled for tomorrow.'
    },
    {
      name: 'Rajiv Malhotra',
      companyName: 'Malhotra Logistics Hub',
      email: 'rajiv@malhotralogistics.com',
      phone: '+91 98110 54321',
      source: 'Cold Outreach',
      serviceId: gstService.id,
      serviceName: 'GST Quarterly & Annual Compliance',
      description: 'Multi-state GST audit reconciliation required.',
      assignedStaffId: staff4.id,
      status: 'CONTACTED',
      notes: 'Requires assistance with multi-branch GSTR-9 filing.'
    },
    {
      name: 'Sunil Rao',
      companyName: 'Apex Manufacturing Pvt Ltd',
      email: 'contact@apex-mfg.com',
      phone: '+91 98220 11223',
      source: 'Trade Show',
      serviceId: iso9001Service.id,
      serviceName: 'ISO 9001:2015 Certification',
      description: 'Converted lead for ISO certification.',
      assignedStaffId: staff1.id,
      status: 'WON',
      convertedClientId: client1.id,
      notes: 'Lead successfully converted to Client record!'
    },
    {
      name: 'Kavita Reddy',
      companyName: 'GreenCore Tech & Industries',
      email: 'compliance@greencore.in',
      phone: '+91 98450 33445',
      source: 'Direct Web Lead',
      serviceId: eprService.id,
      serviceName: 'EPR Registration & Annual Return',
      description: 'EPR registration for imported electronic hardware.',
      assignedStaffId: staff3.id,
      status: 'WON',
      convertedClientId: client2.id,
      notes: 'Onboarded client.'
    },
    {
      name: 'Suresh Raina',
      companyName: 'Raina Auto Components',
      email: 'suresh@rainaauto.com',
      phone: '+91 98230 45678',
      source: 'Website Form',
      serviceId: factoryLicenseService.id,
      serviceName: 'Factory License & Safety Audit',
      description: 'Expansion unit safety clearance in MIDC Pune.',
      assignedStaffId: staff2.id,
      status: 'PROPOSAL',
      notes: 'Shared site inspection proposal.'
    },
    {
      name: 'Alok Nath',
      companyName: 'Heritage Crafts',
      email: 'alok@heritagecrafts.in',
      phone: '+91 98910 87654',
      source: 'Google Search',
      serviceId: trademarkService.id,
      serviceName: 'Trademark & Brand Registration',
      description: 'Brand registration across Class 24 and Class 25.',
      assignedStaffId: staff1.id,
      status: 'LOST',
      notes: 'Client postponed budget for next financial year.'
    },
    {
      name: 'Manish Pandey',
      companyName: 'Pandey Biofuels',
      email: 'manish@pandeybio.com',
      phone: '+91 94150 11224',
      source: 'Industry Event',
      serviceId: iso14001Service.id,
      serviceName: 'ISO 14001 Environmental System',
      description: 'Environmental audit for bio-refinery plant.',
      assignedStaffId: staff5.id,
      status: 'NEW',
      notes: 'Need to send introductory presentation.'
    },
    {
      name: 'Shweta Tiwari',
      companyName: 'Tiwari Pharma Solutions',
      email: 'shweta@tiwaripharma.com',
      phone: '+91 98200 33441',
      source: 'Partner Referral',
      serviceId: iso9001Service.id,
      serviceName: 'ISO 9001:2015 Certification',
      description: 'Pharma unit quality management system certification.',
      assignedStaffId: staff1.id,
      status: 'CONTACTED',
      notes: 'Detailed requirement gathering underway.'
    },
    {
      name: 'Gaurav Gill',
      companyName: 'Gill Heavy Motors',
      email: 'gaurav@gillmotors.com',
      phone: '+91 98140 66778',
      source: 'LinkedIn Outreach',
      serviceId: factoryLicenseService.id,
      serviceName: 'Factory License & Safety Audit',
      description: 'Safety audit for 50,000 sq ft manufacturing plant.',
      assignedStaffId: staff2.id,
      status: 'PROPOSAL',
      notes: 'Submitted proposal of ₹1,20,000.'
    },
    {
      name: 'Divya Dutta',
      companyName: 'Zenith Organic Foods',
      email: 'divya@zenithorganics.com',
      phone: '+91 98880 99001',
      source: 'Website Contact Form',
      serviceId: trademarkService.id,
      serviceName: 'Trademark & Brand Registration',
      description: 'Organic certification trademark registration.',
      assignedStaffId: staff4.id,
      status: 'NEW',
      notes: 'New inquiry assigned to staff.'
    },
    {
      name: 'Karan Mehra',
      companyName: 'Mehra Solar Energy',
      email: 'karan@mehrasolar.in',
      phone: '+91 99100 44332',
      source: 'Exhibition',
      serviceId: iso14001Service.id,
      serviceName: 'ISO 14001 Environmental System',
      description: 'Solar module recycling compliance certification.',
      assignedStaffId: staff5.id,
      status: 'CONTACTED',
      notes: 'Call scheduled with VP Operations.'
    },
    {
      name: 'Sunil Gavaskar',
      companyName: 'Sunny Cricket Equipment',
      email: 'sunil@sunnycricket.com',
      phone: '+91 98210 22110',
      source: 'Referral',
      serviceId: trademarkService.id,
      serviceName: 'Trademark & Brand Registration',
      description: 'Protection for international sports gear brand.',
      assignedStaffId: staff1.id,
      status: 'PROPOSAL',
      notes: 'Negotiating payment terms.'
    },
    {
      name: 'Nisha Singhania',
      companyName: 'Singhania Paper Mills',
      email: 'nisha@singhaniapaper.com',
      phone: '+91 94310 55443',
      source: 'Website',
      serviceId: eprService.id,
      serviceName: 'EPR Registration & Annual Return',
      description: 'Paper packaging recycling authorization.',
      assignedStaffId: staff3.id,
      status: 'NEW',
      notes: 'Awaiting initial documents.'
    },
    {
      name: 'Tarun Mansukhani',
      companyName: 'Metro Logistics',
      email: 'tarun@metrologistics.co.in',
      phone: '+91 98201 99887',
      source: 'Cold Call',
      serviceId: gstService.id,
      serviceName: 'GST Quarterly & Annual Compliance',
      description: 'Fleet transport GST compliance advisory.',
      assignedStaffId: staff4.id,
      status: 'LOST',
      notes: 'Chose in-house accounting team.'
    }
  ];

  for (const lead of leadsData) {
    await prisma.lead.create({ data: lead });
  }

  console.log('✅ Created 15 Realistic Pipeline Leads');

  // Fetch checklist items for linking
  const isoChecklist = await prisma.documentChecklistItem.findMany({ where: { serviceId: iso9001Service.id } });
  const eprChecklist = await prisma.documentChecklistItem.findMany({ where: { serviceId: eprService.id } });
  const gstChecklist = await prisma.documentChecklistItem.findMany({ where: { serviceId: gstService.id } });

  // 6. Create Active Compliance Cases
  
  // Case 1: Apex Mfg - ISO 9001 (Main Demo Case)
  const case1 = await prisma.case.create({
    data: {
      caseNumber: 'CASE-2026-001',
      clientId: client1.id,
      serviceId: iso9001Service.id,
      title: 'ISO 9001:2015 Quality Certification - Apex Mfg',
      description: 'Complete audit, document verification, and ISO 9001 certification execution for Chakan facility.',
      assignedStaffId: staff1.id,
      managerId: manager1.id,
      status: 'DOCUMENTS_PENDING',
      priority: 'HIGH',
      startDate: new Date('2026-08-01'),
      targetCompletionDate: new Date('2026-10-15'),
      totalFee: 50000.00,
      amountPaid: 30000.00,
      outstandingAmount: 20000.00,
      renewalDate: new Date('2027-08-01'),
      documents: {
        create: [
          {
            checklistItemId: isoChecklist.find(i => i.name.includes('Registration'))?.id,
            fileName: 'Apex_CoI_Certificate.pdf',
            originalName: 'Company_Registration_Apex.pdf',
            storagePath: '/uploads/documents/CASE-2026-001/Apex_CoI_Certificate.pdf',
            mimeType: 'application/pdf',
            fileSize: 1048576,
            status: 'APPROVED',
            uploadedById: clientUser1.id,
            uploadedAt: new Date('2026-08-05'),
            reviewedById: staff1.id,
            reviewedAt: new Date('2026-08-06'),
            reviewComment: 'Verified valid ROC incorporation details.'
          },
          {
            checklistItemId: isoChecklist.find(i => i.name.includes('PAN'))?.id,
            fileName: 'Apex_PAN_GST.pdf',
            originalName: 'PAN_GST_Certificate.pdf',
            storagePath: '/uploads/documents/CASE-2026-001/Apex_PAN_GST.pdf',
            mimeType: 'application/pdf',
            fileSize: 524288,
            status: 'APPROVED',
            uploadedById: clientUser1.id,
            uploadedAt: new Date('2026-08-05'),
            reviewedById: staff1.id,
            reviewedAt: new Date('2026-08-06'),
            reviewComment: 'GSTIN matches active database record.'
          },
          {
            checklistItemId: isoChecklist.find(i => i.name.includes('Structure'))?.id,
            fileName: 'Apex_Org_Chart.pdf',
            originalName: 'Org_Structure_2026.pdf',
            storagePath: '/uploads/documents/CASE-2026-001/Apex_Org_Chart.pdf',
            mimeType: 'application/pdf',
            fileSize: 2097152,
            status: 'APPROVED',
            uploadedById: clientUser1.id,
            uploadedAt: new Date('2026-08-10'),
            reviewedById: staff1.id,
            reviewedAt: new Date('2026-08-11'),
            reviewComment: 'Org structure approved by Quality Auditor.'
          },
          {
            checklistItemId: isoChecklist.find(i => i.name.includes('Quality Policy'))?.id,
            fileName: 'Apex_Draft_Quality_Manual_v1.docx',
            originalName: 'Draft_Quality_Manual.docx',
            storagePath: '/uploads/documents/CASE-2026-001/Apex_Draft_Quality_Manual_v1.docx',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            fileSize: 819200,
            status: 'REJECTED',
            uploadedById: clientUser1.id,
            uploadedAt: new Date('2026-08-15'),
            reviewedById: staff1.id,
            reviewedAt: new Date('2026-08-16'),
            reviewComment: 'Mandatory Rejection: Section 4.2 missing Risk Mitigation procedures. Please re-upload updated manual.'
          },
          {
            checklistItemId: isoChecklist.find(i => i.name.includes('Utility'))?.id,
            fileName: '',
            originalName: '',
            storagePath: '',
            mimeType: '',
            fileSize: 0,
            status: 'PENDING'
          }
        ]
      },
      payments: {
        create: [
          {
            amount: 15000.00,
            paymentDate: new Date('2026-08-02'),
            paymentMethod: 'Bank Transfer (NEFT)',
            referenceNumber: 'NEFT-AXIS-99210',
            notes: 'Advance booking payment 30%',
            recordedById: manager1.id
          },
          {
            amount: 15000.00,
            paymentDate: new Date('2026-08-20'),
            paymentMethod: 'UPI / NetBanking',
            referenceNumber: 'UPI-RAZORPAY-8812',
            notes: 'Second installment post document submission',
            recordedById: staff1.id
          }
        ]
      },
      renewals: {
        create: [
          {
            serviceId: iso9001Service.id,
            issueDate: new Date('2025-10-01'),
            expiryDate: new Date('2026-10-01'), // 34 days away -> EXPIRING_SOON
            renewalStatus: 'EXPIRING_SOON',
            reminderDate: new Date('2026-09-01'),
            notes: 'Annual audit renewal upcoming.'
          }
        ]
      },
      comments: {
        create: [
          {
            authorId: staff1.id,
            message: 'Internal Note: Client requested priority turnaround for upcoming vendor qualification audit.',
            visibility: 'INTERNAL'
          },
          {
            authorId: staff1.id,
            message: 'Client Update: Your initial registration documents and PAN/GST certificates have been verified and approved.',
            visibility: 'CLIENT_VISIBLE'
          },
          {
            authorId: staff1.id,
            message: 'Client Update: Quality Manual draft rejected due to missing Risk Mitigation section. Please upload revision.',
            visibility: 'CLIENT_VISIBLE'
          }
        ]
      }
    }
  });

  // Case 2: GreenCore Tech - EPR Registration
  const case2 = await prisma.case.create({
    data: {
      caseNumber: 'CASE-2026-002',
      clientId: client2.id,
      serviceId: eprService.id,
      title: 'EPR Plastic & E-Waste Authorization 2026',
      description: 'CPCB EPR authorization and target fulfillment reporting.',
      assignedStaffId: staff3.id,
      managerId: manager1.id,
      status: 'UNDER_REVIEW',
      priority: 'URGENT',
      startDate: new Date('2026-07-10'),
      targetCompletionDate: new Date('2026-09-15'),
      totalFee: 75000.00,
      amountPaid: 75000.00,
      outstandingAmount: 0.00,
      renewalDate: new Date('2027-07-10'),
      documents: {
        create: [
          {
            checklistItemId: eprChecklist[0]?.id,
            fileName: 'GreenCore_MSME.pdf',
            originalName: 'MSME_Udyam.pdf',
            storagePath: '/uploads/documents/CASE-2026-002/GreenCore_MSME.pdf',
            mimeType: 'application/pdf',
            fileSize: 1200000,
            status: 'APPROVED',
            uploadedById: clientUser2.id,
            uploadedAt: new Date('2026-07-15'),
            reviewedById: staff3.id,
            reviewedAt: new Date('2026-07-16'),
            reviewComment: 'Valid MSME certificate verified.'
          },
          {
            checklistItemId: eprChecklist[1]?.id,
            fileName: 'GreenCore_GST_IEC.pdf',
            originalName: 'GST_IEC_Docs.pdf',
            storagePath: '/uploads/documents/CASE-2026-002/GreenCore_GST_IEC.pdf',
            mimeType: 'application/pdf',
            fileSize: 950000,
            status: 'APPROVED',
            uploadedById: clientUser2.id,
            uploadedAt: new Date('2026-07-15'),
            reviewedById: staff3.id,
            reviewedAt: new Date('2026-07-16'),
            reviewComment: 'Import Export Code validated.'
          }
        ]
      },
      payments: {
        create: [
          {
            amount: 75000.00,
            paymentDate: new Date('2026-07-12'),
            paymentMethod: 'RTGS',
            referenceNumber: 'RTGS-HDFC-100293',
            notes: '100% full fee payment received',
            recordedById: manager1.id
          }
        ]
      },
      renewals: {
        create: [
          {
            serviceId: eprService.id,
            issueDate: new Date('2025-09-02'),
            expiryDate: new Date('2026-09-02'), // 5 days away -> RENEWAL_DUE
            renewalStatus: 'RENEWAL_DUE',
            reminderDate: new Date('2026-08-02'),
            notes: 'CPCB annual renewal due urgently.'
          }
        ]
      },
      comments: {
        create: [
          {
            authorId: staff3.id,
            message: 'Application submitted to CPCB portal. Awaiting regional officer review.',
            visibility: 'CLIENT_VISIBLE'
          }
        ]
      }
    }
  });

  // Case 3: Nova Textiles - GST Annual Compliance
  const case3 = await prisma.case.create({
    data: {
      caseNumber: 'CASE-2026-003',
      clientId: client3.id,
      serviceId: gstService.id,
      title: 'GST Annual Reconciliation & Audit FY25-26',
      description: 'Comprehensive GSTR-9 annual filing and ITC matching.',
      assignedStaffId: staff4.id,
      managerId: manager2.id,
      status: 'APPROVED',
      priority: 'MEDIUM',
      startDate: new Date('2026-06-01'),
      targetCompletionDate: new Date('2026-08-30'),
      totalFee: 35000.00,
      amountPaid: 20000.00,
      outstandingAmount: 15000.00,
      renewalDate: new Date('2027-06-01'),
      documents: {
        create: [
          {
            checklistItemId: gstChecklist[0]?.id,
            fileName: 'Nova_Sales_Purchase_FY26.xlsx',
            originalName: 'Tally_Export_Sales.xlsx',
            storagePath: '/uploads/documents/CASE-2026-003/Nova_Sales_Purchase_FY26.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            fileSize: 4500000,
            status: 'APPROVED',
            uploadedById: clientUser3.id,
            uploadedAt: new Date('2026-06-05'),
            reviewedById: staff4.id,
            reviewedAt: new Date('2026-06-06'),
            reviewComment: 'Verified against portal returns.'
          }
        ]
      },
      payments: {
        create: [
          {
            amount: 20000.00,
            paymentDate: new Date('2026-06-02'),
            paymentMethod: 'Cheque',
            referenceNumber: 'CHQ-882901',
            notes: 'Initial fee retainer',
            recordedById: staff4.id
          }
        ]
      },
      renewals: {
        create: [
          {
            serviceId: gstService.id,
            issueDate: new Date('2025-08-15'),
            expiryDate: new Date('2026-08-15'), // Expired 13 days ago -> EXPIRED
            renewalStatus: 'EXPIRED',
            reminderDate: new Date('2026-07-15'),
            notes: 'Annual compliance agreement expired.'
          }
        ]
      },
      comments: {
        create: [
          {
            authorId: staff4.id,
            message: 'GSTR-9 filing completed successfully. Acknowledgement generated.',
            visibility: 'CLIENT_VISIBLE'
          }
        ]
      }
    }
  });

  // Additional Cases for realistic dashboard statistics (15+ total cases)
  const additionalCasesData = [
    {
      caseNumber: 'CASE-2026-004',
      clientId: client4.id,
      serviceId: iso9001Service.id,
      title: 'ISO 9001 Certification - BluePeak Foods',
      status: 'SUBMITTED',
      priority: 'HIGH',
      totalFee: 50000.00,
      amountPaid: 25000.00,
      outstandingAmount: 25000.00,
      assignedStaffId: staff1.id,
      managerId: manager1.id
    },
    {
      caseNumber: 'CASE-2026-005',
      clientId: client5.id,
      serviceId: factoryLicenseService.id,
      title: 'Factory Safety Approval - UrbanBuild Solutions',
      status: 'UNDER_REVIEW',
      priority: 'URGENT',
      totalFee: 90000.00,
      amountPaid: 45000.00,
      outstandingAmount: 45000.00,
      assignedStaffId: staff2.id,
      managerId: manager2.id
    },
    {
      caseNumber: 'CASE-2026-006',
      clientId: client6.id,
      serviceId: trademarkService.id,
      title: 'TechNova Cloud Brand Trademark',
      status: 'COMPLETED',
      priority: 'LOW',
      totalFee: 25000.00,
      amountPaid: 25000.00,
      outstandingAmount: 0.00,
      assignedStaffId: staff1.id,
      managerId: manager1.id
    },
    {
      caseNumber: 'CASE-2026-007',
      clientId: client7.id,
      serviceId: eprService.id,
      title: 'Prime Packaging EPR Registration',
      status: 'DOCUMENTS_PENDING',
      priority: 'HIGH',
      totalFee: 75000.00,
      amountPaid: 0.00,
      outstandingAmount: 75000.00,
      assignedStaffId: staff3.id,
      managerId: manager1.id
    },
    {
      caseNumber: 'CASE-2026-008',
      clientId: client8.id,
      serviceId: iso14001Service.id,
      title: 'EcoSphere ISO 14001 Audit',
      status: 'DOCUMENTS_RECEIVED',
      priority: 'MEDIUM',
      totalFee: 65000.00,
      amountPaid: 35000.00,
      outstandingAmount: 30000.00,
      assignedStaffId: staff5.id,
      managerId: manager2.id
    },
    {
      caseNumber: 'CASE-2026-009',
      clientId: client1.id,
      serviceId: gstService.id,
      title: 'Apex Manufacturing GST Tax Audit',
      status: 'APPROVED',
      priority: 'MEDIUM',
      totalFee: 35000.00,
      amountPaid: 35000.00,
      outstandingAmount: 0.00,
      assignedStaffId: staff4.id,
      managerId: manager2.id
    },
    {
      caseNumber: 'CASE-2026-010',
      clientId: client2.id,
      serviceId: iso9001Service.id,
      title: 'GreenCore Quality System Renewal',
      status: 'RENEWAL_DUE',
      priority: 'URGENT',
      totalFee: 50000.00,
      amountPaid: 10000.00,
      outstandingAmount: 40000.00,
      assignedStaffId: staff1.id,
      managerId: manager1.id
    },
    {
      caseNumber: 'CASE-2026-011',
      clientId: client3.id,
      serviceId: eprService.id,
      title: 'Nova Textiles Annual Waste Report',
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      totalFee: 75000.00,
      amountPaid: 50000.00,
      outstandingAmount: 25000.00,
      assignedStaffId: staff3.id,
      managerId: manager1.id
    },
    {
      caseNumber: 'CASE-2026-012',
      clientId: client4.id,
      serviceId: trademarkService.id,
      title: 'BluePeak Beverages Logo Protection',
      status: 'DOCUMENTS_PENDING',
      priority: 'LOW',
      totalFee: 25000.00,
      amountPaid: 12500.00,
      outstandingAmount: 12500.00,
      assignedStaffId: staff1.id,
      managerId: manager2.id
    },
    {
      caseNumber: 'CASE-2026-013',
      clientId: client5.id,
      serviceId: iso14001Service.id,
      title: 'UrbanBuild Environmental Certificate',
      status: 'DOCUMENTS_RECEIVED',
      priority: 'HIGH',
      totalFee: 65000.00,
      amountPaid: 30000.00,
      outstandingAmount: 35000.00,
      assignedStaffId: staff5.id,
      managerId: manager2.id
    },
    {
      caseNumber: 'CASE-2026-014',
      clientId: client6.id,
      serviceId: factoryLicenseService.id,
      title: 'TechNova Datacenter Safety Audit',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      totalFee: 90000.00,
      amountPaid: 90000.00,
      outstandingAmount: 0.00,
      assignedStaffId: staff2.id,
      managerId: manager1.id
    },
    {
      caseNumber: 'CASE-2026-015',
      clientId: client8.id,
      serviceId: gstService.id,
      title: 'EcoSphere Annual GST Reconciliation',
      status: 'REJECTED',
      priority: 'HIGH',
      totalFee: 35000.00,
      amountPaid: 10000.00,
      outstandingAmount: 25000.00,
      assignedStaffId: staff4.id,
      managerId: manager2.id
    }
  ];

  for (const item of additionalCasesData) {
    const createdCase = await prisma.case.create({ data: item });
    
    // Add default renewal for each case
    await prisma.renewal.create({
      data: {
        caseId: createdCase.id,
        serviceId: createdCase.serviceId,
        issueDate: new Date('2025-08-01'),
        expiryDate: new Date(Date.now() + Math.floor(Math.random() * 90 - 30) * 86400000),
        renewalStatus: item.status === 'RENEWAL_DUE' ? 'RENEWAL_DUE' : 'ACTIVE',
        reminderDate: new Date()
      }
    });

    // Add activity log
    await prisma.activityLog.create({
      data: {
        caseId: createdCase.id,
        userId: item.assignedStaffId,
        action: 'CASE_CREATED',
        entity: 'Case',
        entityId: createdCase.id,
        metadata: JSON.stringify({ title: createdCase.title, status: createdCase.status })
      }
    });
  }

  console.log('✅ Created 15 Total Compliance Cases with Renewals and Activity Logs');

  // 7. Create System Notifications
  const notificationsData = [
    {
      userId: staff1.id,
      title: 'New Document Uploaded',
      message: 'Apex Manufacturing uploaded Draft Quality Manual v1 for CASE-2026-001.',
      isRead: false,
      linkUrl: '/cases/CASE-2026-001'
    },
    {
      userId: staff1.id,
      title: 'Renewal Due Warning',
      message: 'ISO 9001 certification for Apex Manufacturing is approaching its deadline.',
      isRead: false,
      linkUrl: '/renewals'
    },
    {
      userId: clientUser1.id,
      title: 'Document Approved',
      message: 'Your Company Registration Certificate has been verified and approved.',
      isRead: false,
      linkUrl: '/client/cases'
    },
    {
      userId: clientUser1.id,
      title: 'Document Resubmission Required',
      message: 'Draft Quality Manual was rejected with review comment. Please upload updated file.',
      isRead: false,
      linkUrl: '/client/cases'
    },
    {
      userId: clientUser1.id,
      title: 'Payment Received',
      message: 'Payment of ₹15,000 recorded for CASE-2026-001. Remaining balance: ₹20,000.',
      isRead: true,
      linkUrl: '/client/payments'
    }
  ];

  for (const notif of notificationsData) {
    await prisma.notification.create({ data: notif });
  }

  console.log('✅ Created System Notifications');

  // 8. Create Demo Service Requests
  const clientApex = await prisma.client.findFirst({ where: { companyName: { contains: 'Apex' } } });
  const clientAgarwal = await prisma.client.findFirst({ where: { companyName: { contains: 'Agarwal' } } });

  if (clientApex && iso9001Service) {
    await prisma.serviceRequest.create({
      data: {
        clientId: clientApex.id,
        serviceId: eprService.id,
        requestedById: clientUser1.id,
        description: 'Requesting EPR registration for our new plastic packaging division.',
        status: 'PENDING'
      }
    });
  }

  if (clientAgarwal && eprService) {
    await prisma.serviceRequest.create({
      data: {
        clientId: clientAgarwal.id,
        serviceId: iso9001Service.id,
        requestedById: clientUser2 ? clientUser2.id : null,
        description: 'ISO 9001 annual audit expansion for chemical plant unit 2.',
        status: 'APPROVED',
        notes: 'Pre-audit documentation verified by Manager.'
      }
    });
  }

  console.log('✅ Created Demo Service Requests');

  console.log('\n======================================================');
  console.log('🎉 DRISU COMPLIANCE PORTAL SEEDING COMPLETE!');
  console.log('======================================================');
  console.log('DEMO ACCOUNTS CREATED:');
  console.log('1. Admin:    admin@drisu-demo.local   / Demo@123456');
  console.log('2. Manager:  manager@drisu-demo.local / Demo@123456');
  console.log('3. Staff:    staff1@drisu-demo.local  / Demo@123456');
  console.log('4. Client:   client1@drisu-demo.local / Demo@123456');
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
