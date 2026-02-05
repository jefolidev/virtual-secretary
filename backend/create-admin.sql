-- Create address first (without created_at/updated_at)
INSERT INTO addresses (id, address_line_1, neighborhood, city, state, postal_code, country)
VALUES (
  'admin-address-001',
  'Rua Admin, 123',
  'Centro',
  'Fortaleza',
  'CE',
  '60000000',
  'Brasil'
) ON CONFLICT (id) DO NOTHING;

-- Create professional record first
INSERT INTO professionals (id, session_price, created_at)
VALUES (
  'admin-professional-001',
  100.00,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create professional user (password: Abc12345)
-- Note: Role can only be CLIENT or PROFESSIONAL, no ADMIN
INSERT INTO users (id, name, email, cpf, password, gender, birth_date, role, whatsapp_number, address_id, professional_id)
VALUES (
  'admin-user-001',
  'Test Professional',
  'admin@email.com',
  '99999999901',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'MALE',
  '1990-01-01',
  'PROFESSIONAL',
  '+5511999999999',
  'admin-address-001',
  'admin-professional-001'
) ON CONFLICT (email) DO UPDATE SET
  password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  professional_id = 'admin-professional-001';

-- Show created user
SELECT u.id, u.name, u.email, u.role, u.professional_id
FROM users u
WHERE u.email = 'admin@email.com';
