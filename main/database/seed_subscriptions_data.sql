INSERT INTO "subscriptions" ("id", "service_name", "amount", "currency", "billing_interval", "start_date", "category", "is_active", "created_at", "updated_at") VALUES
(gen_random_uuid(), 'Netflix', 14500, 'KRW', 'monthly', '2024-01-01', '엔터테인먼트', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'Spotify', 10900, 'KRW', 'monthly', '2023-05-10', '음악', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'Adobe Creative Cloud', 30000, 'KRW', 'monthly', '2023-03-15', '소프트웨어', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'AWS S3 Storage', 5000, 'KRW', 'monthly', '2024-02-01', '클라우드', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'Google Workspace', 120000, 'KRW', 'yearly', '2023-07-01', '생산성', TRUE, NOW(), NOW());