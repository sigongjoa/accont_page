INSERT INTO "expenses" ("id", "date", "item", "category", "amount", "payment_method", "status", "currency", "created_at", "updated_at") VALUES
(gen_random_uuid(), '2025-07-01', '점심 식사', '변동비', 12000, '카드', '지불완료', 'KRW', NOW(), NOW()),
(gen_random_uuid(), '2025-07-02', '넷플릭스 구독', '고정비', 14500, '카드', '지불완료', 'KRW', NOW(), NOW()),
(gen_random_uuid(), '2025-07-03', '커피', '변동비', 4500, '현금', '지불완료', 'KRW', NOW(), NOW()),
(gen_random_uuid(), '2025-07-04', '사이드 프로젝트 서버 비용', '프로젝트', 50000, '계좌이체', '대기중', 'KRW', NOW(), NOW()),
(gen_random_uuid(), '2025-07-05', '교통비', '변동비', 2500, '카드', '지불완료', 'KRW', NOW(), NOW());