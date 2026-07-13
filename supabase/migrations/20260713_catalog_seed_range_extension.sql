-- ═══════════════════════════════════════════════════════════════════════════
-- Extension des gammes du catalogue : complète les 9 marques avec les modèles
-- actuellement commercialisés en France (séries BMW R/S/M/F/G/K/C complètes,
-- Kawasaki ZX/H2, Honda Fireblade/Gold Wing, KTM RC/EXC, Triumph classiques…).
-- Ajoute un profil d'entretien "scooter électrique" (CE 02 / CE 04).
--
-- ⚠ Intervalles = valeurs par défaut plausibles, à valider avec les carnets
-- constructeur officiels (éditables depuis l'admin).
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.catalog_maintenance_profiles (key, label, tasks) VALUES
('scooter_electrique', 'Scooter électrique', '[
  {"titre":"Contrôle plaquettes de frein avant/arrière","categorie":"Freinage","intervalKm":8000,"intervalMonths":12,"priority":"important"},
  {"titre":"Remplacement liquide de frein","categorie":"Liquides","description":"Purge et remplacement du liquide de frein DOT 4.","intervalMonths":24,"priority":"important"},
  {"titre":"Contrôle courroie de transmission","categorie":"Transmission","intervalKm":10000,"intervalMonths":12,"priority":"normal"},
  {"titre":"Contrôle batterie et connectique haute tension","categorie":"Contrôle","intervalMonths":12,"priority":"important"},
  {"titre":"Contrôle pneumatiques (usure & pression)","categorie":"Pneumatiques","intervalKm":5000,"intervalMonths":6,"priority":"normal"},
  {"titre":"Révision principale","categorie":"Révision","intervalKm":10000,"intervalMonths":12,"priority":"important"}
]'::jsonb)
ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label, tasks = EXCLUDED.tasks;

INSERT INTO public.catalog_models (brand_id, name, category, years, specs, profile_id)
SELECT b.id, m.name, m.category, m.years, m.specs, p.id
FROM (VALUES

  -- ═══ BMW — série R (boxer / cardan) ═══
  ('bmw', 'R 1300 GS Adventure', 'motos', '{2025,2026}'::int[],
   '{"cylindree":"1300 cm³","puissance":"145 ch","transmission":"Cardan, 6 rapports","refroidissement":"Air/liquide"}'::jsonb, 'moto_cardan_10000'),
  ('bmw', 'R 1300 R', 'motos', '{2025,2026}'::int[],
   '{"cylindree":"1300 cm³","puissance":"145 ch","transmission":"Cardan, 6 rapports","refroidissement":"Air/liquide"}'::jsonb, 'moto_cardan_10000'),
  ('bmw', 'R 1300 RS', 'motos', '{2025,2026}'::int[],
   '{"cylindree":"1300 cm³","puissance":"145 ch","transmission":"Cardan, 6 rapports","refroidissement":"Air/liquide"}'::jsonb, 'moto_cardan_10000'),
  ('bmw', 'R 1300 RT', 'motos', '{2025,2026}'::int[],
   '{"cylindree":"1300 cm³","puissance":"145 ch","transmission":"Cardan, 6 rapports","refroidissement":"Air/liquide"}'::jsonb, 'moto_cardan_10000'),
  ('bmw', 'R 1250 RT', 'motos', '{2019,2020,2021,2022,2023,2024}'::int[],
   '{"cylindree":"1254 cm³","puissance":"136 ch","transmission":"Cardan, 6 rapports","refroidissement":"Air/liquide"}'::jsonb, 'moto_cardan_10000'),
  ('bmw', 'R 1250 R', 'motos', '{2019,2020,2021,2022,2023}'::int[],
   '{"cylindree":"1254 cm³","puissance":"136 ch","transmission":"Cardan, 6 rapports","refroidissement":"Air/liquide"}'::jsonb, 'moto_cardan_10000'),
  ('bmw', 'R 12', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"1170 cm³","puissance":"95 ch","transmission":"Cardan, 6 rapports","refroidissement":"Air/huile"}'::jsonb, 'moto_cardan_10000'),
  ('bmw', 'R 12 G/S', 'motos', '{2025,2026}'::int[],
   '{"cylindree":"1170 cm³","puissance":"109 ch","transmission":"Cardan, 6 rapports","refroidissement":"Air/huile"}'::jsonb, 'moto_cardan_10000'),

  -- ═══ BMW — séries S et M ═══
  ('bmw', 'S 1000 R', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"999 cm³","puissance":"170 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('bmw', 'M 1000 RR', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"999 cm³","puissance":"212 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('bmw', 'M 1000 R', 'motos', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"999 cm³","puissance":"210 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('bmw', 'M 1000 XR', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"999 cm³","puissance":"201 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),

  -- ═══ BMW — séries F et G ═══
  ('bmw', 'F 900 GS', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"895 cm³","puissance":"105 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('bmw', 'F 900 GS Adventure', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"895 cm³","puissance":"105 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('bmw', 'F 750 GS', 'motos', '{2018,2019,2020,2021,2022,2023,2024}'::int[],
   '{"cylindree":"853 cm³","puissance":"77 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('bmw', 'F 850 GS', 'motos', '{2018,2019,2020,2021,2022,2023}'::int[],
   '{"cylindree":"853 cm³","puissance":"95 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('bmw', 'G 310 GS', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025}'::int[],
   '{"cylindree":"313 cm³","puissance":"34 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),

  -- ═══ BMW — série K (6 cylindres, cardan) ═══
  ('bmw', 'K 1600 GT', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1649 cm³","puissance":"160 ch","transmission":"Cardan, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_cardan_10000'),
  ('bmw', 'K 1600 GTL', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1649 cm³","puissance":"160 ch","transmission":"Cardan, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_cardan_10000'),
  ('bmw', 'K 1600 B', 'motos', '{2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1649 cm³","puissance":"160 ch","transmission":"Cardan, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_cardan_10000'),

  -- ═══ BMW — série C (scooters, dont électriques) ═══
  ('bmw', 'CE 04', 'scooters', '{2022,2023,2024,2025,2026}'::int[],
   '{"puissance":"42 ch (électrique)","transmission":"Courroie","refroidissement":"Liquide"}'::jsonb, 'scooter_electrique'),
  ('bmw', 'CE 02', 'scooters', '{2024,2025,2026}'::int[],
   '{"puissance":"15 ch (électrique)","transmission":"Courroie","refroidissement":"Air"}'::jsonb, 'scooter_electrique'),

  -- ═══ KAWASAKI — compléments ═══
  ('kawasaki', 'Ninja ZX-10R', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"998 cm³","puissance":"203 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_4cylindres'),
  ('kawasaki', 'Ninja ZX-4RR', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"399 cm³","puissance":"77 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_4cylindres'),
  ('kawasaki', 'Ninja H2 SX', 'motos', '{2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"998 cm³","puissance":"200 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_4cylindres'),
  ('kawasaki', 'Z650RS', 'motos', '{2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"649 cm³","puissance":"68 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_bicylindre'),
  ('kawasaki', 'Z125', 'motos', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"125 cm³","puissance":"15 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_petite'),
  ('kawasaki', 'Ninja 125', 'motos', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"125 cm³","puissance":"15 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_petite'),
  ('kawasaki', 'Versys-X 300', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"296 cm³","puissance":"40 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_bicylindre'),

  -- ═══ HONDA — compléments motos ═══
  ('honda', 'NX500', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"471 cm³","puissance":"48 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_bicylindre'),
  ('honda', 'CB500X', 'motos', '{2019,2020,2021,2022,2023}'::int[],
   '{"cylindree":"471 cm³","puissance":"48 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_bicylindre'),
  ('honda', 'CBR650R', 'motos', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"649 cm³","puissance":"95 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_4cylindres'),
  ('honda', 'CBR1000RR-R Fireblade', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"999 cm³","puissance":"217 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_4cylindres'),
  ('honda', 'NT1100', 'motos', '{2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1084 cm³","puissance":"102 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_bicylindre'),
  ('honda', 'GL1800 Gold Wing', 'motos', '{2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1833 cm³","puissance":"126 ch","transmission":"Cardan, DCT 7 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_cardan_10000'),
  ('honda', 'CRF300L', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"286 cm³","puissance":"27 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_trail'),
  ('honda', 'CB125R', 'motos', '{2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"124 cm³","puissance":"15 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_petite'),
  ('honda', 'Rebel 1100', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1084 cm³","puissance":"87 ch","transmission":"Chaîne, 6 rapports (ou DCT)","refroidissement":"Liquide"}'::jsonb, 'moto_jap_bicylindre'),

  -- ═══ HONDA — compléments scooters ═══
  ('honda', 'Forza 750', 'scooters', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"745 cm³","puissance":"58 ch","transmission":"DCT 6 rapports","refroidissement":"Liquide"}'::jsonb, 'scooter_cvt_gt'),
  ('honda', 'ADV350', 'scooters', '{2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"330 cm³","puissance":"29 ch","transmission":"Variateur CVT","refroidissement":"Liquide"}'::jsonb, 'scooter_cvt_gt'),
  ('honda', 'SH350i', 'scooters', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"330 cm³","puissance":"29 ch","transmission":"Variateur CVT","refroidissement":"Liquide"}'::jsonb, 'scooter_cvt_gt'),
  ('honda', 'Vision 110', 'scooters', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"109 cm³","puissance":"8,7 ch","transmission":"Variateur CVT","refroidissement":"Air"}'::jsonb, 'scooter_cvt_petit'),

  -- ═══ SUZUKI — compléments ═══
  ('suzuki', 'Katana', 'motos', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"999 cm³","puissance":"152 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_4cylindres'),
  ('suzuki', 'GSX-S950', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"999 cm³","puissance":"95 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_4cylindres'),
  ('suzuki', 'GSX-S125', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"124 cm³","puissance":"15 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_petite'),
  ('suzuki', 'GSX-R125', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"124 cm³","puissance":"15 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_petite'),
  ('suzuki', 'DR-Z4S', 'motos', '{2025,2026}'::int[],
   '{"cylindree":"398 cm³","puissance":"38 ch","transmission":"Chaîne, 5 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_trail'),
  ('suzuki', 'V-Strom 800RE', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"776 cm³","puissance":"84 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_jap_bicylindre'),
  ('suzuki', 'Burgman Street 125EX', 'scooters', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"124 cm³","puissance":"8,7 ch","transmission":"Variateur CVT","refroidissement":"Air"}'::jsonb, 'scooter_cvt_petit'),

  -- ═══ KTM — compléments ═══
  ('ktm', 'RC 125', 'motos', '{2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"125 cm³","puissance":"15 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_petite'),
  ('ktm', 'RC 390', 'motos', '{2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"399 cm³","puissance":"45 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_petite'),
  ('ktm', '690 Enduro R', 'motos', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"693 cm³","puissance":"74 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_trail'),
  ('ktm', '890 SMT', 'motos', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"889 cm³","puissance":"105 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('ktm', '1290 Super Duke GT', 'motos', '{2019,2020,2021,2022,2023,2024,2025}'::int[],
   '{"cylindree":"1301 cm³","puissance":"175 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('ktm', '300 EXC', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"293 cm³ (2T)","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_trail'),
  ('ktm', '350 EXC-F', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"350 cm³","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_trail'),
  ('ktm', '500 EXC-F', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"511 cm³","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_trail'),

  -- ═══ TRIUMPH — compléments ═══
  ('triumph', 'Daytona 660', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"660 cm³","puissance":"95 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('triumph', 'Tiger Sport 800', 'motos', '{2025,2026}'::int[],
   '{"cylindree":"798 cm³","puissance":"115 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('triumph', 'Speed Twin 900', 'motos', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"900 cm³","puissance":"65 ch","transmission":"Chaîne, 5 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('triumph', 'Speed Twin 1200', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1200 cm³","puissance":"100 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('triumph', 'Scrambler 900', 'motos', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"900 cm³","puissance":"65 ch","transmission":"Chaîne, 5 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('triumph', 'Scrambler 1200 XE', 'motos', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1200 cm³","puissance":"90 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('triumph', 'Rocket 3 Storm', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"2458 cm³","puissance":"182 ch","transmission":"Cardan, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_cardan_10000'),
  ('triumph', 'Bonneville Bobber', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1200 cm³","puissance":"78 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),
  ('triumph', 'Bonneville Speedmaster', 'motos', '{2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1200 cm³","puissance":"78 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_euro_10000'),

  -- ═══ VOGE — compléments (gamme France) ═══
  ('voge', '125R', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"125 cm³","puissance":"15 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_petite'),
  ('voge', '525R', 'motos', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"494 cm³","puissance":"47 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_bicylindre'),
  ('voge', '525 ACX', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"494 cm³","puissance":"47 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_bicylindre'),
  ('voge', '625 DSX', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"578 cm³","puissance":"58 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_bicylindre'),
  ('voge', '800 DSX Rally', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"798 cm³","puissance":"95 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_bicylindre_grosse'),
  ('voge', '300 Rally', 'motos', '{2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"292 cm³","puissance":"29 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_trail'),
  ('voge', 'SR1 ADV 125', 'scooters', '{2024,2025,2026}'::int[],
   '{"cylindree":"125 cm³","puissance":"11 ch","transmission":"Variateur CVT","refroidissement":"Liquide"}'::jsonb, 'scooter_cvt_petit'),

  -- ═══ CF MOTO — compléments ═══
  ('cf-moto', '300NK', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"292 cm³","puissance":"29 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_petite'),
  ('cf-moto', '300SR', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"292 cm³","puissance":"29 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_petite'),
  ('cf-moto', '450CL-C', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"449 cm³","puissance":"41 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_bicylindre'),
  ('cf-moto', '675SR-R', 'motos', '{2025,2026}'::int[],
   '{"cylindree":"675 cm³","puissance":"95 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_bicylindre_grosse'),
  ('cf-moto', '800MT-X', 'motos', '{2025,2026}'::int[],
   '{"cylindree":"799 cm³","puissance":"95 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_bicylindre_grosse'),
  ('cf-moto', 'CFORCE 400', 'quads', '{2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"400 cm³","transmission":"CVT, 4x4","refroidissement":"Liquide"}'::jsonb, 'quad_utilitaire'),

  -- ═══ ZONTES — compléments ═══
  ('zontes', '350GK', 'motos', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"348 cm³","puissance":"39 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_mono_petite'),
  ('zontes', '703RR', 'motos', '{2025,2026}'::int[],
   '{"cylindree":"699 cm³","puissance":"95 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb, 'moto_bicylindre_grosse'),
  ('zontes', '368G', 'scooters', '{2024,2025,2026}'::int[],
   '{"cylindree":"368 cm³","puissance":"36 ch","transmission":"Variateur CVT","refroidissement":"Liquide"}'::jsonb, 'scooter_cvt_gt')

) AS m(brand_slug, name, category, years, specs, profile_key)
JOIN public.catalog_brands b ON b.slug = m.brand_slug
JOIN public.catalog_maintenance_profiles p ON p.key = m.profile_key
ON CONFLICT (brand_id, category, name) DO NOTHING;
