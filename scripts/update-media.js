// Update V3 migration and DevDataSeeder with real Unsplash images
const fs = require('fs');

const migration = `-- Seed property_media with real building images from Unsplash (free, no attribution)
-- Each property gets 3 photos: 1 cover + 2 gallery

INSERT INTO property_media (media_id, property_id, media_type, s3_key, alt_text, sort_order, cover) VALUES
  ('a0000000-0000-0000-0000-000000000001', (SELECT property_id FROM properties WHERE title = 'Skyline 3BHK Apartment' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop', 'Modern apartment building exterior', 1, true),
  ('a0000000-0000-0000-0000-000000000002', (SELECT property_id FROM properties WHERE title = 'Skyline 3BHK Apartment' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop', 'Apartment living room with modern interior', 2, false),
  ('a0000000-0000-0000-0000-000000000003', (SELECT property_id FROM properties WHERE title = 'Skyline 3BHK Apartment' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', 'Apartment bedroom with city view', 3, false);

INSERT INTO property_media (media_id, property_id, media_type, s3_key, alt_text, sort_order, cover) VALUES
  ('a0000000-0000-0000-0000-000000000004', (SELECT property_id FROM properties WHERE title = 'Green Valley Villa' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop', 'Modern villa with swimming pool', 1, true),
  ('a0000000-0000-0000-0000-000000000005', (SELECT property_id FROM properties WHERE title = 'Green Valley Villa' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop', 'Villa exterior with garden', 2, false),
  ('a0000000-0000-0000-0000-000000000006', (SELECT property_id FROM properties WHERE title = 'Green Valley Villa' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop', 'Villa interior living space', 3, false);

INSERT INTO property_media (media_id, property_id, media_type, s3_key, alt_text, sort_order, cover) VALUES
  ('a0000000-0000-0000-0000-000000000007', (SELECT property_id FROM properties WHERE title = 'Sunrise 2BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop', 'Apartment building under construction', 1, true),
  ('a0000000-0000-0000-0000-000000000008', (SELECT property_id FROM properties WHERE title = 'Sunrise 2BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', 'Modern 2BHK apartment interior', 2, false),
  ('a0000000-0000-0000-0000-000000000009', (SELECT property_id FROM properties WHERE title = 'Sunrise 2BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop', 'Kitchen area with modern fittings', 3, false);

INSERT INTO property_media (media_id, property_id, media_type, s3_key, alt_text, sort_order, cover) VALUES
  ('a0000000-0000-0000-0000-000000000010', (SELECT property_id FROM properties WHERE title = 'Palm Grove 3BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop', 'Luxury apartment with sea view', 1, true),
  ('a0000000-0000-0000-0000-000000000011', (SELECT property_id FROM properties WHERE title = 'Palm Grove 3BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop', 'Spacious living room with balcony', 2, false),
  ('a0000000-0000-0000-0000-000000000012', (SELECT property_id FROM properties WHERE title = 'Palm Grove 3BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800&h=600&fit=crop', 'Master bedroom with premium finish', 3, false);

INSERT INTO property_media (media_id, property_id, media_type, s3_key, alt_text, sort_order, cover) VALUES
  ('a0000000-0000-0000-0000-000000000013', (SELECT property_id FROM properties WHERE title = 'Lotus Residency 2BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop', 'Cozy apartment interior', 1, true),
  ('a0000000-0000-0000-0000-000000000014', (SELECT property_id FROM properties WHERE title = 'Lotus Residency 2BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop', 'Apartment building entrance', 2, false),
  ('a0000000-0000-0000-0000-000000000015', (SELECT property_id FROM properties WHERE title = 'Lotus Residency 2BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop', 'Children play area', 3, false);

INSERT INTO property_media (media_id, property_id, media_type, s3_key, alt_text, sort_order, cover) VALUES
  ('a0000000-0000-0000-0000-000000000016', (SELECT property_id FROM properties WHERE title = 'Imperial Heights 3BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop', 'Modern high-rise building', 1, true),
  ('a0000000-0000-0000-0000-000000000017', (SELECT property_id FROM properties WHERE title = 'Imperial Heights 3BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop', 'Smart home interior', 2, false),
  ('a0000000-0000-0000-0000-000000000018', (SELECT property_id FROM properties WHERE title = 'Imperial Heights 3BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=600&fit=crop', 'EV charging station', 3, false);

INSERT INTO property_media (media_id, property_id, media_type, s3_key, alt_text, sort_order, cover) VALUES
  ('a0000000-0000-0000-0000-000000000019', (SELECT property_id FROM properties WHERE title = 'Cedar Court Independent House' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop', 'Independent house with garden', 1, true),
  ('a0000000-0000-0000-0000-000000000020', (SELECT property_id FROM properties WHERE title = 'Cedar Court Independent House' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop', 'Traditional house exterior', 2, false),
  ('a0000000-0000-0000-0000-000000000021', (SELECT property_id FROM properties WHERE title = 'Cedar Court Independent House' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop', 'Servant quarter area', 3, false);

INSERT INTO property_media (media_id, property_id, media_type, s3_key, alt_text, sort_order, cover) VALUES
  ('a0000000-0000-0000-0000-000000000022', (SELECT property_id FROM properties WHERE title = 'Marina Bay Office Tower' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop', 'Modern office tower exterior', 1, true),
  ('a0000000-0000-0000-0000-000000000023', (SELECT property_id FROM properties WHERE title = 'Marina Bay Office Tower' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop', 'Open office space interior', 2, false),
  ('a0000000-0000-0000-0000-000000000024', (SELECT property_id FROM properties WHERE title = 'Marina Bay Office Tower' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1562664377-e4c8a4e4c8c7?w=800&h=600&fit=crop', 'Office lobby with 24x7 security', 3, false);

INSERT INTO property_media (media_id, property_id, media_type, s3_key, alt_text, sort_order, cover) VALUES
  ('a0000000-0000-0000-0000-000000000025', (SELECT property_id FROM properties WHERE title = 'Corner Shop Retail' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=600&fit=crop', 'Corner retail shop', 1, true),
  ('a0000000-0000-0000-0000-000000000026', (SELECT property_id FROM properties WHERE title = 'Corner Shop Retail' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop', 'Retail space interior', 2, false),
  ('a0000000-0000-0000-0000-000000000027', (SELECT property_id FROM properties WHERE title = 'Corner Shop Retail' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop', 'Shop front view', 3, false);

INSERT INTO property_media (media_id, property_id, media_type, s3_key, alt_text, sort_order, cover) VALUES
  ('a0000000-0000-0000-0000-000000000028', (SELECT property_id FROM properties WHERE title = 'Happy Homes 1BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop', 'Compact 1BHK apartment', 1, true),
  ('a0000000-0000-0000-0000-000000000029', (SELECT property_id FROM properties WHERE title = 'Happy Homes 1BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop', 'Near metro station location', 2, false),
  ('a0000000-0000-0000-0000-000000000030', (SELECT property_id FROM properties WHERE title = 'Happy Homes 1BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop', 'Apartment lift lobby', 3, false);

INSERT INTO property_media (media_id, property_id, media_type, s3_key, alt_text, sort_order, cover) VALUES
  ('a0000000-0000-0000-0000-000000000031', (SELECT property_id FROM properties WHERE title = 'Metro Logistics Warehouse' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop', 'Large warehouse interior', 1, true),
  ('a0000000-0000-0000-0000-000000000032', (SELECT property_id FROM properties WHERE title = 'Metro Logistics Warehouse' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop', 'Warehouse loading dock', 2, false),
  ('a0000000-0000-0000-0000-000000000033', (SELECT property_id FROM properties WHERE title = 'Metro Logistics Warehouse' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1565891741441-64926e441838?w=800&h=600&fit=crop', 'Warehouse storage area', 3, false);

INSERT INTO property_media (media_id, property_id, media_type, s3_key, alt_text, sort_order, cover) VALUES
  ('a0000000-0000-0000-0000-000000000034', (SELECT property_id FROM properties WHERE title = 'Hillcrest Garden Plot' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop', 'Open plot with greenery', 1, true),
  ('a0000000-0000-0000-0000-000000000035', (SELECT property_id FROM properties WHERE title = 'Hillcrest Garden Plot' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&h=600&fit=crop', 'Garden plot boundary', 2, false),
  ('a0000000-0000-0000-0000-000000000036', (SELECT property_id FROM properties WHERE title = 'Hillcrest Garden Plot' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop', 'Plot with mature trees', 3, false);

INSERT INTO property_media (media_id, property_id, media_type, s3_key, alt_text, sort_order, cover) VALUES
  ('a0000000-0000-0000-0000-000000000037', (SELECT property_id FROM properties WHERE title = 'Old Bungalow Duplex' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop', 'Heritage bungalow exterior', 1, true),
  ('a0000000-0000-0000-0000-000000000038', (SELECT property_id FROM properties WHERE title = 'Old Bungalow Duplex' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop', 'Traditional bungalow interior', 2, false),
  ('a0000000-0000-0000-0000-000000000039', (SELECT property_id FROM properties WHERE title = 'Old Bungalow Duplex' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop', 'Bungalow garden area', 3, false);

INSERT INTO property_media (media_id, property_id, media_type, s3_key, alt_text, sort_order, cover) VALUES
  ('a0000000-0000-0000-0000-000000000040', (SELECT property_id FROM properties WHERE title = 'Booked Skyline 2BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600566752229-250ed79470f0?w=800&h=600&fit=crop', 'Booked apartment building', 1, true),
  ('a0000000-0000-0000-0000-000000000041', (SELECT property_id FROM properties WHERE title = 'Booked Skyline 2BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop', 'Apartment common area', 2, false),
  ('a0000000-0000-0000-0000-000000000042', (SELECT property_id FROM properties WHERE title = 'Booked Skyline 2BHK' LIMIT 1), 'PHOTO', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop', 'Apartment gym facility', 3, false);
`;

fs.writeFileSync('src/main/resources/db/migration/V3__seed_property_media.sql', migration);
console.log('V3 migration written: ' + migration.split('\n').length + ' lines');
