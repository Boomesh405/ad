-- ============================================================================
-- EstateHub — Demo seed data
-- Runs once via Flyway (any environment: docker compose, local default profile).
-- All accounts use password: Demo@1234
-- ============================================================================

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
INSERT INTO users (user_id, name, mobile, email, password_hash, role, kyc_verified, active) VALUES
('00000000-0000-0000-0000-000000000001', 'Demo Admin',      '9000000001', 'admin@demo.estatehub.in', '$2a$12$5rlIpvQ25aLPwCmLgJNGfOrCQIiNduTwraT2NQJxSpasKr7vV/x.u', 'SUPER_ADMIN',   TRUE,  TRUE),
('00000000-0000-0000-0000-000000000011', 'Skyline Developers',   '9000000011', 'skyline@demo.estatehub.in', '$2a$12$5rlIpvQ25aLPwCmLgJNGfOrCQIiNduTwraT2NQJxSpasKr7vV/x.u', 'BUILDER_OWNER', TRUE,  TRUE),
('00000000-0000-0000-0000-000000000012', 'GreenValley Estates',  '9000000012', 'greenvalley@demo.estatehub.in', '$2a$12$5rlIpvQ25aLPwCmLgJNGfOrCQIiNduTwraT2NQJxSpasKr7vV/x.u', 'BUILDER_OWNER', TRUE,  TRUE),
('00000000-0000-0000-0000-000000000013', 'Imperial Homes',       '9000000013', 'imperial@demo.estatehub.in', '$2a$12$5rlIpvQ25aLPwCmLgJNGfOrCQIiNduTwraT2NQJxSpasKr7vV/x.u', 'BUILDER_OWNER', TRUE,  TRUE),
('00000000-0000-0000-0000-000000000021', 'Rohan Kapoor',     '9000000021', 'rohan@demo.estatehub.in', '$2a$12$5rlIpvQ25aLPwCmLgJNGfOrCQIiNduTwraT2NQJxSpasKr7vV/x.u', 'AGENT',         TRUE,  TRUE),
('00000000-0000-0000-0000-000000000022', 'Meera Nair',       '9000000022', 'meera@demo.estatehub.in', '$2a$12$5rlIpvQ25aLPwCmLgJNGfOrCQIiNduTwraT2NQJxSpasKr7vV/x.u', 'AGENT',         TRUE,  TRUE),
('00000000-0000-0000-0000-000000000031', 'Amit Verma',       '9000000031', 'amit@demo.estatehub.in', '$2a$12$5rlIpvQ25aLPwCmLgJNGfOrCQIiNduTwraT2NQJxSpasKr7vV/x.u', 'BUYER_TENANT',  TRUE,  TRUE),
('00000000-0000-0000-0000-000000000032', 'Kavya Iyer',       '9000000032', 'kavya@demo.estatehub.in', '$2a$12$5rlIpvQ25aLPwCmLgJNGfOrCQIiNduTwraT2NQJxSpasKr7vV/x.u', 'BUYER_TENANT',  TRUE,  TRUE),
('00000000-0000-0000-0000-000000000033', 'Vikram Singh',     '9000000033', 'vikram@demo.estatehub.in', '$2a$12$5rlIpvQ25aLPwCmLgJNGfOrCQIiNduTwraT2NQJxSpasKr7vV/x.u', 'BUYER_TENANT',  TRUE,  TRUE);

-- ---------------------------------------------------------------------------
-- properties (14 listings across 8 cities; 10 live, 2 pending, 1 rejected, 1 booked)
-- ---------------------------------------------------------------------------
INSERT INTO properties (property_id, owner_id, agent_id, title, property_type, bhk_config,
                        carpet_area_sqft, built_up_area_sqft, floor_number, total_floors,
                        price, monthly_rent, maintenance_charges, address, pincode, city, state, landmark,
                        rera_number, project_completion_date, possession_status, listing_status,
                        rejection_reason, view_count, created_at) VALUES
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000021',
 'Skyline 3BHK Apartment', 'APARTMENT', '3 BHK', 1200, 1450, 7, 18, 12500000, NULL, 4500,
 'Koramangala Main Road', '560034', 'Bengaluru', 'Karnataka', 'Forum Mall', NULL, NULL, 'READY_TO_MOVE', 'ACTIVE', NULL, 214, now() - interval '42 days'),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000022',
 'Green Valley Villa', 'VILLA', '4 BHK', 2400, 2900, NULL, 2, 35000000, NULL, 8000,
 'Gachibowli Financial District', '500032', 'Hyderabad', 'Telangana', 'IIIT Hyderabad', NULL, NULL, 'READY_TO_MOVE', 'ACTIVE', NULL, 156, now() - interval '38 days'),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000021',
 'Sunrise 2BHK', 'APARTMENT', '2 BHK', 950, 1150, 4, 12, 6500000, NULL, 2500,
 'Hinjewadi Phase 2', '411057', 'Pune', 'Maharashtra', 'Rajiv Gandhi Infotech Park', 'P52100012345', DATE '2027-03-31', 'UNDER_CONSTRUCTION', 'PENDING_APPROVAL', NULL, 89, now() - interval '10 days'),
('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000022',
 'Palm Grove 3BHK', 'APARTMENT', '3 BHK', 1350, 1600, 12, 25, 28500000, NULL, 6000,
 'Andheri West', '400053', 'Mumbai', 'Maharashtra', 'Versova Metro', NULL, NULL, 'READY_TO_MOVE', 'ACTIVE', NULL, 178, now() - interval '30 days'),
('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000011', NULL,
 'Lotus Residency 2BHK', 'APARTMENT', '2 BHK', 1050, 1250, 3, 9, 9800000, NULL, 3000,
 'Velachery', '600042', 'Chennai', 'Tamil Nadu', 'Phoenix Marketcity', NULL, NULL, 'READY_TO_MOVE', 'ACTIVE', NULL, 96, now() - interval '25 days'),
('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000021',
 'Imperial Heights 3BHK', 'APARTMENT', '3 BHK', 1500, 1800, 15, 30, 32000000, NULL, 7500,
 'Dwarka Sector 21', '110075', 'Delhi', 'Delhi', 'Dwarka Expressway', 'DL1234567890', DATE '2026-12-31', 'UNDER_CONSTRUCTION', 'ACTIVE', NULL, 132, now() - interval '20 days'),
('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000013', NULL,
 'Cedar Court Independent House', 'INDEPENDENT_HOUSE', '2 BHK', 1400, 1650, 1, 2, 14500000, NULL, 2000,
 'Malviya Nagar', '302017', 'Jaipur', 'Rajasthan', 'GT Central Park', NULL, NULL, 'READY_TO_MOVE', 'ACTIVE', NULL, 61, now() - interval '18 days'),
('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000022',
 'Marina Bay Office Tower', 'OFFICE_SPACE', NULL, 2200, 2600, 8, 20, 55000000, 250000, 18000,
 'Bandra Kurla Complex', '400051', 'Mumbai', 'Maharashtra', 'MCA Ground', NULL, NULL, 'READY_TO_MOVE', 'ACTIVE', NULL, 84, now() - interval '15 days'),
('00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000011', NULL,
 'Corner Shop Retail', 'RETAIL', NULL, 600, 700, 0, 1, 9000000, 45000, 1500,
 'Jubilee Hills Road 36', '500033', 'Hyderabad', 'Telangana', 'Pedda Cheruvu', NULL, NULL, 'READY_TO_MOVE', 'ACTIVE', NULL, 44, now() - interval '12 days'),
('00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000021',
 'Happy Homes 1BHK', 'APARTMENT', '1 BHK', 650, 800, 5, 14, 5500000, NULL, 1800,
 'Salt Lake Sector V', '700091', 'Kolkata', 'West Bengal', 'Bidhannagar', NULL, NULL, 'READY_TO_MOVE', 'ACTIVE', NULL, 73, now() - interval '9 days'),
('00000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000012', NULL,
 'Metro Logistics Warehouse', 'WAREHOUSE', NULL, 5000, 5200, NULL, 1, 42000000, NULL, 20000,
 'Chakan MIDC', '410501', 'Pune', 'Maharashtra', 'NH-48', NULL, NULL, 'READY_TO_MOVE', 'ACTIVE', NULL, 38, now() - interval '7 days'),
('00000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000013', NULL,
 'Hillcrest Garden Plot', 'PLOT', NULL, 1800, NULL, NULL, NULL, 22000000, NULL, NULL,
 'Whitefield', '560066', 'Bengaluru', 'Karnataka', 'Hope Farm Junction', NULL, NULL, 'READY_TO_MOVE', 'PENDING_APPROVAL', NULL, 29, now() - interval '5 days'),
('00000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000021',
 'Old Bungalow Duplex', 'INDEPENDENT_HOUSE', '4 BHK', 2600, 3000, 1, 2, 48000000, NULL, 5000,
 'Adyar', '600020', 'Chennai', 'Tamil Nadu', 'Theosophical Society', NULL, NULL, 'READY_TO_MOVE', 'REJECTED',
 'Title deed mismatch — owner documents pending verification', 12, now() - interval '4 days'),
('00000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000011', NULL,
 'Booked Skyline 2BHK', 'APARTMENT', '2 BHK', 1100, 1300, 6, 18, 11500000, NULL, 4000,
 'Koramangala 5th Block', '560095', 'Bengaluru', 'Karnataka', 'Jyoti Nivas College', NULL, NULL, 'READY_TO_MOVE', 'BOOKED', NULL, 201, now() - interval '21 days');

-- -------
-- ---------------------------------------------------------------------------
-- property_amenities
-- ---------------------------------------------------------------------------
INSERT INTO property_amenities (property_id, amenity) VALUES
('00000000-0000-0000-0000-000000000101', 'Car parking'), ('00000000-0000-0000-0000-000000000101', 'Gym'), ('00000000-0000-0000-0000-000000000101', 'Lift'), ('00000000-0000-0000-0000-000000000101', '24x7 water'),
('00000000-0000-0000-0000-000000000102', 'Private garden'), ('00000000-0000-0000-0000-000000000102', 'Swimming pool'), ('00000000-0000-0000-0000-000000000102', 'Home automation'),
('00000000-0000-0000-0000-000000000104', 'Sea-facing balcony'), ('00000000-0000-0000-0000-000000000104', 'Clubhouse'), ('00000000-0000-0000-0000-000000000104', 'Gym'), ('00000000-0000-0000-0000-000000000104', 'Lift'),
('00000000-0000-0000-0000-000000000105', 'Temple nearby'), ('00000000-0000-0000-0000-000000000105', 'Children play area'), ('00000000-0000-0000-0000-000000000105', 'Lift'),
('00000000-0000-0000-0000-000000000106', 'RERA registered'), ('00000000-0000-0000-0000-000000000106', 'Smart lock'), ('00000000-0000-0000-0000-000000000106', 'EV charging'),
('00000000-0000-0000-0000-000000000107', 'Garden'), ('00000000-0000-0000-0000-000000000107', 'Servant quarter'),
('00000000-0000-0000-0000-000000000108', 'Lobby'), ('00000000-0000-0000-0000-000000000108', '24x7 security'), ('00000000-0000-0000-0000-000000000108', 'Parking'),
('00000000-0000-0000-0000-000000000110', 'Near metro'), ('00000000-0000-0000-0000-000000000110', 'Lift'),
('00000000-0000-0000-0000-000000000114', 'Car parking'), ('00000000-0000-0000-0000-000000000114', 'Lift'), ('00000000-0000-0000-0000-000000000114', 'Gym');

-- ---------------------------------------------------------------------------
-- bookings (1 confirmed + 1 pending + 1 cancelled)
-- ---------------------------------------------------------------------------
INSERT INTO bookings (booking_id, property_id, buyer_id, token_amount, status,
                      razorpay_order_id, razorpay_payment_id, cancelled_at, refund_amount, created_at) VALUES
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000031',
 115000, 'CONFIRMED', 'order_demo_0001', 'pay_demo_0001', NULL, NULL, now() - interval '20 days'),
('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000032',
 125000, 'PENDING_PAYMENT', 'order_demo_0002', NULL, NULL, NULL, now() - interval '2 days'),
('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000033',
 65000, 'CANCELLED', 'order_demo_0003', NULL, now() - interval '3 days', 65000, now() - interval '6 days');
-- ---------------------------------------------------------------------------
-- enquiries + crm_notes
-- ---------------------------------------------------------------------------
INSERT INTO enquiries (enquiry_id, property_id, agent_id, buyer_name, buyer_mobile, otp_verified,
                       stage, lead_score, created_at) VALUES
('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000021',
 'Ramesh Kumar', '9811111111', TRUE, 'SITE_VISIT_DONE', 80, now() - interval '12 days'),
('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000022',
 'Priya Sharma', '9822222222', TRUE, 'NEGOTIATION', 65, now() - interval '8 days'),
('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000021',
 'Arjun Mehta', '9833333333', FALSE, 'NEW', 20, now() - interval '3 days'),
('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000022',
 'Sneha Reddy', '9844444444', TRUE, 'CONTACTED', 40, now() - interval '1 day');

INSERT INTO crm_notes (note_id, enquiry_id, agent_id, note_text, follow_up_date, created_at) VALUES
('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000021',
 'Buyer visited site, liked the 7th floor unit with park view', DATE '2026-08-20', now() - interval '11 days'),
('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000022',
 'Negotiating price — offered a 2% discount, awaiting builder approval', DATE '2026-08-15', now() - interval '7 days'),
('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000021',
 'Initial call done; buyer wants a virtual tour before site visit', DATE '2026-08-25', now() - interval '2 days');
