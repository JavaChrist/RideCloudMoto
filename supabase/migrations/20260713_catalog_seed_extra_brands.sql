-- ═══════════════════════════════════════════════════════════════════════════
-- Seed complémentaire du catalogue : Honda, BMW, KTM, Triumph.
--
-- ⚠ Intervalles d'entretien = valeurs par défaut plausibles, à valider avec
-- les carnets constructeur officiels (éditables depuis l'admin).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Marques ──────────────────────────────────────────────────────────────────
INSERT INTO public.catalog_brands (name, slug, logo_url) VALUES
  ('Honda',   'honda',   '/logo-honda.png'),
  ('BMW',     'bmw',     '/logo-bmw.png'),
  ('KTM',     'ktm',     '/logo-ktm.png'),
  ('Triumph', 'triumph', '/logo-triumph.png')
ON CONFLICT (slug) DO NOTHING;

-- ── Nouveaux profils d'entretien ─────────────────────────────────────────────
INSERT INTO public.catalog_maintenance_profiles (key, label, tasks) VALUES

('moto_euro_10000', 'Moto européenne — chaîne (entretien 10 000 km)', '[
  {"titre":"Rodage : 1ère vidange moteur + filtre","categorie":"Moteur","firstDueKm":1000,"priority":"urgent"},
  {"titre":"Vidange huile moteur + filtre","categorie":"Moteur","intervalKm":10000,"intervalMonths":12,"priority":"important"},
  {"titre":"Contrôle / lubrification chaîne","categorie":"Transmission","intervalKm":1000,"intervalMonths":2,"priority":"normal"},
  {"titre":"Contrôle jeu aux soupapes","categorie":"Moteur","intervalKm":20000,"priority":"important"},
  {"titre":"Remplacement bougies","categorie":"Moteur","intervalKm":20000,"priority":"normal"},
  {"titre":"Filtre à air","categorie":"Moteur","intervalKm":20000,"priority":"normal"},
  {"titre":"Contrôle plaquettes de frein avant/arrière","categorie":"Freinage","intervalKm":8000,"intervalMonths":12,"priority":"important"},
  {"titre":"Remplacement liquide de frein","categorie":"Liquides","description":"Purge et remplacement du liquide de frein DOT 4.","intervalMonths":24,"priority":"important"},
  {"titre":"Remplacement liquide de refroidissement","categorie":"Liquides","intervalKm":24000,"intervalMonths":36,"priority":"normal"},
  {"titre":"Contrôle pneumatiques (usure & pression)","categorie":"Pneumatiques","intervalKm":5000,"intervalMonths":6,"priority":"normal"},
  {"titre":"Révision principale","categorie":"Révision","intervalKm":10000,"intervalMonths":12,"priority":"important"}
]'::jsonb),

('moto_cardan_10000', 'Moto à cardan (BMW boxer…) — entretien 10 000 km', '[
  {"titre":"Rodage : 1ère vidange moteur + filtre","categorie":"Moteur","firstDueKm":1000,"priority":"urgent"},
  {"titre":"Vidange huile moteur + filtre","categorie":"Moteur","intervalKm":10000,"intervalMonths":12,"priority":"important"},
  {"titre":"Huile de couple conique / cardan","categorie":"Transmission","intervalKm":20000,"intervalMonths":24,"priority":"important"},
  {"titre":"Contrôle jeu aux soupapes","categorie":"Moteur","intervalKm":20000,"priority":"important"},
  {"titre":"Remplacement bougies","categorie":"Moteur","intervalKm":20000,"priority":"normal"},
  {"titre":"Filtre à air","categorie":"Moteur","intervalKm":20000,"priority":"normal"},
  {"titre":"Contrôle plaquettes de frein avant/arrière","categorie":"Freinage","intervalKm":8000,"intervalMonths":12,"priority":"important"},
  {"titre":"Remplacement liquide de frein","categorie":"Liquides","description":"Purge et remplacement du liquide de frein DOT 4.","intervalMonths":24,"priority":"important"},
  {"titre":"Remplacement liquide de refroidissement","categorie":"Liquides","intervalKm":24000,"intervalMonths":36,"priority":"normal"},
  {"titre":"Contrôle pneumatiques (usure & pression)","categorie":"Pneumatiques","intervalKm":5000,"intervalMonths":6,"priority":"normal"},
  {"titre":"Révision principale","categorie":"Révision","intervalKm":10000,"intervalMonths":12,"priority":"important"}
]'::jsonb)

ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label, tasks = EXCLUDED.tasks;

-- ── Modèles ──────────────────────────────────────────────────────────────────
INSERT INTO public.catalog_models (brand_id, name, category, years, specs, profile_id)
SELECT b.id, m.name, m.category, m.years, m.specs, p.id
FROM (VALUES

  -- ═══ HONDA — motos ═══
  ('honda', 'CB500 Hornet', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"471 cm³","puissance":"48 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_bicylindre'),
  ('honda', 'CBR500R', 'motos', '{2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"471 cm³","puissance":"48 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_bicylindre'),
  ('honda', 'CB650R', 'motos', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"649 cm³","puissance":"95 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_4cylindres'),
  ('honda', 'CB750 Hornet', 'motos', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"755 cm³","puissance":"92 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_bicylindre'),
  ('honda', 'XL750 Transalp', 'motos', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"755 cm³","puissance":"92 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_bicylindre'),
  ('honda', 'CRF1100L Africa Twin', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1084 cm³","puissance":"102 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_bicylindre'),
  ('honda', 'NC750X', 'motos', '{2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"745 cm³","puissance":"58 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_bicylindre'),
  ('honda', 'CB1000 Hornet', 'motos', '{2025,2026}'::int[],
   '{"cylindree":"999 cm³","puissance":"152 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_4cylindres'),
  ('honda', 'Rebel 500', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"471 cm³","puissance":"46 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_bicylindre'),

  -- ═══ HONDA — scooters ═══
  ('honda', 'PCX 125', 'scooters', '{2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"125 cm³","puissance":"12,5 ch","transmission":"Variateur CVT","refroidissement":"Liquide"}'::jsonb, 'scooter_cvt_petit'),
  ('honda', 'Forza 125', 'scooters', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"125 cm³","puissance":"15 ch","transmission":"Variateur CVT","refroidissement":"Liquide"}'::jsonb, 'scooter_cvt_petit'),
  ('honda', 'Forza 350', 'scooters', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"330 cm³","puissance":"29 ch","transmission":"Variateur CVT","refroidissement":"Liquide"}'::jsonb, 'scooter_cvt_gt'),
  ('honda', 'SH125i', 'scooters', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"125 cm³","puissance":"13 ch","transmission":"Variateur CVT","refroidissement":"Liquide"}'::jsonb, 'scooter_cvt_petit'),
  ('honda', 'X-ADV 750', 'scooters', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"745 cm³","puissance":"58 ch","transmission":"DCT 6 rapports","refroidissement":"Liquide"}'::jsonb, 'scooter_cvt_gt'),

  -- ═══ HONDA — quads ═══
  ('honda', 'Fourtrax TRX420', 'quads', '{2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"420 cm³","transmission":"4x4","refroidissement":"Liquide"}'::jsonb, 'quad_utilitaire'),
  ('honda', 'Fourtrax TRX520', 'quads', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"518 cm³","transmission":"4x4","refroidissement":"Liquide"}'::jsonb, 'quad_utilitaire'),

  -- ═══ BMW — motos ═══
  ('bmw', 'G 310 R', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"313 cm³","puissance":"34 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('bmw', 'F 800 GS', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"895 cm³","puissance":"87 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('bmw', 'F 900 R', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"895 cm³","puissance":"105 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('bmw', 'F 900 XR', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"895 cm³","puissance":"105 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('bmw', 'S 1000 RR', 'motos', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"999 cm³","puissance":"210 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('bmw', 'S 1000 XR', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"999 cm³","puissance":"170 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('bmw', 'R 1250 GS', 'motos', '{2019,2020,2021,2022,2023}'::int[],
   '{"cylindree":"1254 cm³","puissance":"136 ch","transmission":"Cardan, 6 rapports","refroidissement":"Air/liquide"}'::jsonb, 'moto_cardan_10000'),
  ('bmw', 'R 1300 GS', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"1300 cm³","puissance":"145 ch","transmission":"Cardan, 6 rapports","refroidissement":"Air/liquide"}'::jsonb, 'moto_cardan_10000'),
  ('bmw', 'R 12 nineT', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"1170 cm³","puissance":"109 ch","transmission":"Cardan, 6 rapports","refroidissement":"Air/huile"}'::jsonb, 'moto_cardan_10000'),
  ('bmw', 'R 18', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1802 cm³","puissance":"91 ch","transmission":"Cardan, 6 rapports","refroidissement":"Air/huile"}'::jsonb, 'moto_cardan_10000'),

  -- ═══ BMW — scooters ═══
  ('bmw', 'C 400 X', 'scooters', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"350 cm³","puissance":"34 ch","transmission":"Variateur CVT","refroidissement":"Liquide"}'::jsonb, 'scooter_cvt_gt'),
  ('bmw', 'C 400 GT', 'scooters', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"350 cm³","puissance":"34 ch","transmission":"Variateur CVT","refroidissement":"Liquide"}'::jsonb, 'scooter_cvt_gt'),

  -- ═══ KTM — motos ═══
  ('ktm', '125 Duke', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"125 cm³","puissance":"15 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_petite'),
  ('ktm', '390 Duke', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"399 cm³","puissance":"45 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_petite'),
  ('ktm', '390 Adventure', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"399 cm³","puissance":"45 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_trail'),
  ('ktm', '690 SMC R', 'motos', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"693 cm³","puissance":"75 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('ktm', '790 Duke', 'motos', '{2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"799 cm³","puissance":"105 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('ktm', '890 Adventure', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"889 cm³","puissance":"105 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('ktm', '990 Duke', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"947 cm³","puissance":"123 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('ktm', '1290 Super Adventure S', 'motos', '{2021,2022,2023,2024,2025}'::int[],
   '{"cylindree":"1301 cm³","puissance":"160 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('ktm', '1390 Super Duke R', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"1350 cm³","puissance":"190 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),

  -- ═══ TRIUMPH — motos ═══
  ('triumph', 'Speed 400', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"398 cm³","puissance":"40 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_petite'),
  ('triumph', 'Scrambler 400 X', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"398 cm³","puissance":"40 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_trail'),
  ('triumph', 'Trident 660', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"660 cm³","puissance":"81 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('triumph', 'Tiger Sport 660', 'motos', '{2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"660 cm³","puissance":"81 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('triumph', 'Street Triple 765', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"765 cm³","puissance":"120 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('triumph', 'Speed Triple 1200 RS', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1160 cm³","puissance":"180 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('triumph', 'Tiger 900', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"888 cm³","puissance":"108 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('triumph', 'Tiger 1200', 'motos', '{2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1160 cm³","puissance":"150 ch","transmission":"Cardan, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_cardan_10000'),
  ('triumph', 'Bonneville T100', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"900 cm³","puissance":"65 ch","transmission":"Chaîne, 5 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('triumph', 'Bonneville T120', 'motos', '{2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1200 cm³","puissance":"80 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000')

) AS m(brand_slug, name, category, years, specs, profile_key)
JOIN public.catalog_brands b ON b.slug = m.brand_slug
JOIN public.catalog_maintenance_profiles p ON p.key = m.profile_key
ON CONFLICT (brand_id, category, name) DO NOTHING;
