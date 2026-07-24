export const seedData: any = {
  organizations: {
    'mock-tenant-1': {
      name: 'Acme Corp',
      createdAt: '2026-01-01T00:00:00Z',
      adminId: 'admin-001'
    }
  },
  users: {
    'admin-001': {
      id: 'admin-001',
      email: 'admin@hrcore.dev',
      tenantId: 'mock-tenant-1',
      fullName: 'Admin User',
      phone: '+1 555 9999',
      companyName: 'Acme Corp',
      position: 'Administrator',
      role: 'admin',
    }
  },
  tenants: {
    'mock-tenant-1': {
      employees: {},
      attendance: {},
      leaves: {},
      projects: {},
      announcements: {},
      tickets: {}
    }
  },
  Config: {
    setupComplete: true,
  },
}
