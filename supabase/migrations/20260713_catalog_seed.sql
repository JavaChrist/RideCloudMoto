-- ═══════════════════════════════════════════════════════════════════════════
-- Seed du catalogue multi-marques : Voge, Kawasaki, Suzuki, CF Moto, Zontes.
--
-- ⚠ Les intervalles d'entretien des marques ajoutées (hors Voge) sont des
-- valeurs par défaut plausibles : à VALIDER avec les carnets constructeur
-- officiels avant onboarding du concessionnaire (éditables depuis l'admin).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Marques ──────────────────────────────────────────────────────────────────
INSERT INTO public.catalog_brands (name, slug, logo_url) VALUES
  ('Voge',     'voge',     '/logo-voge.png'),
  ('Kawasaki', 'kawasaki', '/logo-kawasaki.png'),
  ('Suzuki',   'suzuki',   '/logo-suzuki.png'),
  ('CF Moto',  'cf-moto',  NULL),
  ('Zontes',   'zontes',   NULL)
ON CONFLICT (slug) DO NOTHING;

-- ── Profils d'entretien ──────────────────────────────────────────────────────
INSERT INTO public.catalog_maintenance_profiles (key, label, tasks) VALUES

('moto_mono_petite', 'Moto — monocylindre routier (≈300 cm³)', '[
  {"titre":"Rodage : 1ère vidange moteur + filtre","categorie":"Moteur","description":"Vidange de rodage à effectuer entre 800 et 1 000 km.","firstDueKm":1000,"priority":"urgent"},
  {"titre":"Vidange huile moteur + filtre","categorie":"Moteur","intervalKm":6000,"intervalMonths":12,"priority":"important"},
  {"titre":"Contrôle / lubrification chaîne","categorie":"Transmission","intervalKm":1000,"intervalMonths":2,"priority":"normal"},
  {"titre":"Contrôle jeu aux soupapes","categorie":"Moteur","intervalKm":12000,"priority":"important"},
  {"titre":"Remplacement bougie","categorie":"Moteur","intervalKm":12000,"priority":"normal"},
  {"titre":"Filtre à air","categorie":"Moteur","intervalKm":12000,"priority":"normal"},
  {"titre":"Contrôle plaquettes de frein avant/arrière","categorie":"Freinage","intervalKm":8000,"intervalMonths":12,"priority":"important"},
  {"titre":"Remplacement liquide de frein","categorie":"Liquides","description":"Purge et remplacement du liquide de frein DOT 4.","intervalMonths":24,"priority":"important"},
  {"titre":"Remplacement liquide de refroidissement","categorie":"Liquides","intervalKm":24000,"intervalMonths":36,"priority":"normal"},
  {"titre":"Contrôle pneumatiques (usure & pression)","categorie":"Pneumatiques","intervalKm":5000,"intervalMonths":6,"priority":"normal"},
  {"titre":"Révision principale","categorie":"Révision","intervalKm":6000,"intervalMonths":12,"priority":"important"}
]'::jsonb),

('moto_mono_trail', 'Moto — monocylindre trail', '[
  {"titre":"Rodage : 1ère vidange moteur + filtre","categorie":"Moteur","firstDueKm":1000,"priority":"urgent"},
  {"titre":"Vidange huile moteur + filtre","categorie":"Moteur","intervalKm":6000,"intervalMonths":12,"priority":"important"},
  {"titre":"Contrôle / lubrification chaîne (usage trail)","categorie":"Transmission","intervalKm":800,"intervalMonths":2,"priority":"normal"},
  {"titre":"Contrôle jeu aux soupapes","categorie":"Moteur","intervalKm":12000,"priority":"important"},
  {"titre":"Remplacement bougie","categorie":"Moteur","intervalKm":12000,"priority":"normal"},
  {"titre":"Filtre à air (contrôle renforcé tout-terrain)","categorie":"Moteur","intervalKm":8000,"priority":"normal"},
  {"titre":"Contrôle plaquettes de frein avant/arrière","categorie":"Freinage","intervalKm":8000,"intervalMonths":12,"priority":"important"},
  {"titre":"Remplacement liquide de frein","categorie":"Liquides","description":"Purge et remplacement du liquide de frein DOT 4.","intervalMonths":24,"priority":"important"},
  {"titre":"Remplacement liquide de refroidissement","categorie":"Liquides","intervalKm":24000,"intervalMonths":36,"priority":"normal"},
  {"titre":"Contrôle pneumatiques (usure & pression)","categorie":"Pneumatiques","intervalKm":5000,"intervalMonths":6,"priority":"normal"},
  {"titre":"Révision principale","categorie":"Révision","intervalKm":6000,"intervalMonths":12,"priority":"important"}
]'::jsonb),

('moto_bicylindre', 'Moto — bicylindre (≈500 cm³, entretien 6 000 km)', '[
  {"titre":"Rodage : 1ère vidange moteur + filtre","categorie":"Moteur","firstDueKm":1000,"priority":"urgent"},
  {"titre":"Vidange huile moteur + filtre","categorie":"Moteur","intervalKm":6000,"intervalMonths":12,"priority":"important"},
  {"titre":"Contrôle / lubrification chaîne","categorie":"Transmission","intervalKm":1000,"intervalMonths":2,"priority":"normal"},
  {"titre":"Contrôle jeu aux soupapes","categorie":"Moteur","intervalKm":24000,"priority":"important"},
  {"titre":"Remplacement bougies","categorie":"Moteur","intervalKm":12000,"priority":"normal"},
  {"titre":"Filtre à air","categorie":"Moteur","intervalKm":12000,"priority":"normal"},
  {"titre":"Contrôle plaquettes de frein avant/arrière","categorie":"Freinage","intervalKm":8000,"intervalMonths":12,"priority":"important"},
  {"titre":"Remplacement liquide de frein","categorie":"Liquides","description":"Purge et remplacement du liquide de frein DOT 4.","intervalMonths":24,"priority":"important"},
  {"titre":"Remplacement liquide de refroidissement","categorie":"Liquides","intervalKm":24000,"intervalMonths":36,"priority":"normal"},
  {"titre":"Contrôle pneumatiques (usure & pression)","categorie":"Pneumatiques","intervalKm":5000,"intervalMonths":6,"priority":"normal"},
  {"titre":"Révision principale","categorie":"Révision","intervalKm":6000,"intervalMonths":12,"priority":"important"}
]'::jsonb),

('moto_bicylindre_grosse', 'Moto — bi/tricylindre gros cube (entretien 8 000 km)', '[
  {"titre":"Rodage : 1ère vidange moteur + filtre","categorie":"Moteur","firstDueKm":1000,"priority":"urgent"},
  {"titre":"Vidange huile moteur + filtre","categorie":"Moteur","intervalKm":8000,"intervalMonths":12,"priority":"important"},
  {"titre":"Contrôle / lubrification chaîne","categorie":"Transmission","intervalKm":1000,"intervalMonths":2,"priority":"normal"},
  {"titre":"Contrôle jeu aux soupapes","categorie":"Moteur","intervalKm":24000,"priority":"important"},
  {"titre":"Remplacement bougies","categorie":"Moteur","intervalKm":16000,"priority":"normal"},
  {"titre":"Filtre à air","categorie":"Moteur","intervalKm":16000,"priority":"normal"},
  {"titre":"Contrôle plaquettes de frein avant/arrière","categorie":"Freinage","intervalKm":8000,"intervalMonths":12,"priority":"important"},
  {"titre":"Remplacement liquide de frein","categorie":"Liquides","description":"Purge et remplacement du liquide de frein DOT 4.","intervalMonths":24,"priority":"important"},
  {"titre":"Remplacement liquide de refroidissement","categorie":"Liquides","intervalKm":24000,"intervalMonths":36,"priority":"normal"},
  {"titre":"Contrôle pneumatiques (usure & pression)","categorie":"Pneumatiques","intervalKm":5000,"intervalMonths":6,"priority":"normal"},
  {"titre":"Révision principale","categorie":"Révision","intervalKm":8000,"intervalMonths":12,"priority":"important"}
]'::jsonb),

('moto_jap_bicylindre', 'Moto japonaise — bicylindre (entretien 12 000 km)', '[
  {"titre":"Rodage : 1ère vidange moteur + filtre","categorie":"Moteur","firstDueKm":1000,"priority":"urgent"},
  {"titre":"Vidange huile moteur + filtre","categorie":"Moteur","intervalKm":12000,"intervalMonths":12,"priority":"important"},
  {"titre":"Contrôle / lubrification chaîne","categorie":"Transmission","intervalKm":1000,"intervalMonths":2,"priority":"normal"},
  {"titre":"Contrôle jeu aux soupapes","categorie":"Moteur","intervalKm":24000,"priority":"important"},
  {"titre":"Remplacement bougies","categorie":"Moteur","intervalKm":24000,"priority":"normal"},
  {"titre":"Filtre à air","categorie":"Moteur","intervalKm":18000,"priority":"normal"},
  {"titre":"Contrôle plaquettes de frein avant/arrière","categorie":"Freinage","intervalKm":8000,"intervalMonths":12,"priority":"important"},
  {"titre":"Remplacement liquide de frein","categorie":"Liquides","description":"Purge et remplacement du liquide de frein DOT 4.","intervalMonths":24,"priority":"important"},
  {"titre":"Remplacement liquide de refroidissement","categorie":"Liquides","intervalKm":24000,"intervalMonths":36,"priority":"normal"},
  {"titre":"Contrôle pneumatiques (usure & pression)","categorie":"Pneumatiques","intervalKm":5000,"intervalMonths":6,"priority":"normal"},
  {"titre":"Révision principale","categorie":"Révision","intervalKm":12000,"intervalMonths":12,"priority":"important"}
]'::jsonb),

('moto_jap_4cylindres', 'Moto japonaise — 4 cylindres (entretien 12 000 km)', '[
  {"titre":"Rodage : 1ère vidange moteur + filtre","categorie":"Moteur","firstDueKm":1000,"priority":"urgent"},
  {"titre":"Vidange huile moteur + filtre","categorie":"Moteur","intervalKm":12000,"intervalMonths":12,"priority":"important"},
  {"titre":"Contrôle / lubrification chaîne","categorie":"Transmission","intervalKm":1000,"intervalMonths":2,"priority":"normal"},
  {"titre":"Contrôle jeu aux soupapes","categorie":"Moteur","intervalKm":24000,"priority":"important"},
  {"titre":"Remplacement bougies","categorie":"Moteur","intervalKm":24000,"priority":"normal"},
  {"titre":"Filtre à air","categorie":"Moteur","intervalKm":18000,"priority":"normal"},
  {"titre":"Contrôle plaquettes de frein avant/arrière","categorie":"Freinage","intervalKm":8000,"intervalMonths":12,"priority":"important"},
  {"titre":"Remplacement liquide de frein","categorie":"Liquides","description":"Purge et remplacement du liquide de frein DOT 4.","intervalMonths":24,"priority":"important"},
  {"titre":"Remplacement liquide de refroidissement","categorie":"Liquides","intervalKm":24000,"intervalMonths":36,"priority":"normal"},
  {"titre":"Contrôle pneumatiques (usure & pression)","categorie":"Pneumatiques","intervalKm":5000,"intervalMonths":6,"priority":"normal"},
  {"titre":"Révision principale","categorie":"Révision","intervalKm":12000,"intervalMonths":12,"priority":"important"}
]'::jsonb),

('scooter_cvt_petit', 'Scooter — CVT 125 cm³', '[
  {"titre":"Rodage : 1ère vidange moteur","categorie":"Moteur","firstDueKm":1000,"priority":"urgent"},
  {"titre":"Vidange huile moteur + filtre","categorie":"Moteur","intervalKm":5000,"intervalMonths":12,"priority":"important"},
  {"titre":"Huile de transmission finale","categorie":"Transmission","intervalKm":6000,"intervalMonths":12,"priority":"normal"},
  {"titre":"Courroie de variateur (CVT)","categorie":"Transmission","description":"Contrôle et remplacement de la courroie de transmission.","intervalKm":10000,"priority":"important"},
  {"titre":"Galets de variateur","categorie":"Transmission","intervalKm":12000,"priority":"normal"},
  {"titre":"Bougie","categorie":"Moteur","intervalKm":10000,"priority":"normal"},
  {"titre":"Contrôle plaquettes de frein avant/arrière","categorie":"Freinage","intervalKm":8000,"intervalMonths":12,"priority":"important"},
  {"titre":"Remplacement liquide de frein","categorie":"Liquides","description":"Purge et remplacement du liquide de frein DOT 4.","intervalMonths":24,"priority":"important"},
  {"titre":"Contrôle pneumatiques (usure & pression)","categorie":"Pneumatiques","intervalKm":5000,"intervalMonths":6,"priority":"normal"},
  {"titre":"Révision principale","categorie":"Révision","intervalKm":5000,"intervalMonths":12,"priority":"important"}
]'::jsonb),

('scooter_cvt_gt', 'Scooter — CVT GT (300-400 cm³)', '[
  {"titre":"Rodage : 1ère vidange moteur","categorie":"Moteur","firstDueKm":1000,"priority":"urgent"},
  {"titre":"Vidange huile moteur + filtre","categorie":"Moteur","intervalKm":6000,"intervalMonths":12,"priority":"important"},
  {"titre":"Huile de transmission finale","categorie":"Transmission","intervalKm":6000,"intervalMonths":12,"priority":"normal"},
  {"titre":"Courroie de variateur (CVT)","categorie":"Transmission","intervalKm":12000,"priority":"important"},
  {"titre":"Galets de variateur","categorie":"Transmission","intervalKm":12000,"priority":"normal"},
  {"titre":"Bougie","categorie":"Moteur","intervalKm":12000,"priority":"normal"},
  {"titre":"Contrôle plaquettes de frein avant/arrière","categorie":"Freinage","intervalKm":8000,"intervalMonths":12,"priority":"important"},
  {"titre":"Remplacement liquide de frein","categorie":"Liquides","description":"Purge et remplacement du liquide de frein DOT 4.","intervalMonths":24,"priority":"important"},
  {"titre":"Remplacement liquide de refroidissement","categorie":"Liquides","intervalKm":24000,"intervalMonths":36,"priority":"normal"},
  {"titre":"Contrôle pneumatiques (usure & pression)","categorie":"Pneumatiques","intervalKm":5000,"intervalMonths":6,"priority":"normal"},
  {"titre":"Révision principale","categorie":"Révision","intervalKm":6000,"intervalMonths":12,"priority":"important"}
]'::jsonb),

('quad_loisir', 'Quad — loisir (CVT)', '[
  {"titre":"Rodage : 1ère vidange moteur + filtre","categorie":"Moteur","firstDueKm":500,"priority":"urgent"},
  {"titre":"Vidange huile moteur + filtre","categorie":"Moteur","description":"Usage intensif ou tout-terrain : rapprocher l''échéance.","intervalKm":2500,"intervalMonths":12,"priority":"important"},
  {"titre":"Filtre à air (nettoyage / remplacement)","categorie":"Moteur","description":"Contrôle fréquent en usage poussiéreux.","intervalKm":1500,"intervalMonths":6,"priority":"important"},
  {"titre":"Courroie de variateur (CVT)","categorie":"Transmission","intervalKm":5000,"intervalMonths":24,"priority":"important"},
  {"titre":"Graissage châssis, rotules et cardans","categorie":"Transmission","intervalKm":1000,"intervalMonths":6,"priority":"normal"},
  {"titre":"Bougie","categorie":"Moteur","intervalKm":5000,"priority":"normal"},
  {"titre":"Contrôle plaquettes de frein","categorie":"Freinage","intervalKm":4000,"intervalMonths":12,"priority":"important"},
  {"titre":"Remplacement liquide de frein","categorie":"Liquides","intervalMonths":24,"priority":"important"},
  {"titre":"Contrôle pneumatiques (usure & pression)","categorie":"Pneumatiques","intervalKm":2500,"intervalMonths":6,"priority":"normal"},
  {"titre":"Révision principale","categorie":"Révision","intervalKm":2500,"intervalMonths":12,"priority":"important"}
]'::jsonb),

('quad_utilitaire', 'Quad — utilitaire 4x4', '[
  {"titre":"Rodage : 1ère vidange moteur + filtre","categorie":"Moteur","firstDueKm":500,"priority":"urgent"},
  {"titre":"Vidange huile moteur + filtre","categorie":"Moteur","description":"Usage intensif ou tout-terrain : rapprocher l''échéance.","intervalKm":2500,"intervalMonths":12,"priority":"important"},
  {"titre":"Filtre à air (nettoyage / remplacement)","categorie":"Moteur","description":"Contrôle fréquent en usage poussiéreux ou boueux.","intervalKm":1500,"intervalMonths":6,"priority":"important"},
  {"titre":"Huile de différentiels avant/arrière","categorie":"Transmission","intervalKm":5000,"intervalMonths":24,"priority":"important"},
  {"titre":"Courroie de variateur (CVT)","categorie":"Transmission","intervalKm":5000,"intervalMonths":24,"priority":"important"},
  {"titre":"Graissage châssis, rotules et cardans","categorie":"Transmission","intervalKm":1000,"intervalMonths":6,"priority":"normal"},
  {"titre":"Bougie","categorie":"Moteur","intervalKm":5000,"priority":"normal"},
  {"titre":"Contrôle plaquettes de frein","categorie":"Freinage","intervalKm":4000,"intervalMonths":12,"priority":"important"},
  {"titre":"Remplacement liquide de frein","categorie":"Liquides","intervalMonths":24,"priority":"important"},
  {"titre":"Remplacement liquide de refroidissement","categorie":"Liquides","intervalKm":20000,"intervalMonths":36,"priority":"normal"},
  {"titre":"Contrôle pneumatiques (usure & pression)","categorie":"Pneumatiques","intervalKm":2500,"intervalMonths":6,"priority":"normal"},
  {"titre":"Révision principale","categorie":"Révision","intervalKm":2500,"intervalMonths":12,"priority":"important"}
]'::jsonb)

ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label, tasks = EXCLUDED.tasks;

-- ── Modèles ──────────────────────────────────────────────────────────────────
INSERT INTO public.catalog_models (brand_id, name, category, years, specs, profile_id)
SELECT b.id, m.name, m.category, m.years, m.specs, p.id
FROM (VALUES

  -- ═══ VOGE (catalogue existant, repris à l'identique) ═══
  ('voge', '300R', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"292 cm³","puissance":"29 ch (21,5 kW)","couple":"25 Nm","poids":"162 kg","reservoir":"16 L","hauteurSelle":"795 mm","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide","freinAvant":"Disque 300 mm, ABS","freinArriere":"Disque 240 mm, ABS","pneuAvant":"110/70 R17","pneuArriere":"150/60 R17","capaciteHuile":"1,9 L","normeEuro":"Euro 5"}'::jsonb,
   'moto_mono_petite'),
  ('voge', '300 AC', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"292 cm³","puissance":"29 ch (21,5 kW)","couple":"25 Nm","poids":"175 kg","reservoir":"16 L","hauteurSelle":"775 mm","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide","freinAvant":"Disque 300 mm, ABS","freinArriere":"Disque 240 mm, ABS","pneuAvant":"100/90 R18","pneuArriere":"140/70 R17","capaciteHuile":"1,9 L","normeEuro":"Euro 5"}'::jsonb,
   'moto_mono_petite'),
  ('voge', '300 DS', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"292 cm³","puissance":"29 ch (21,5 kW)","couple":"25 Nm","poids":"178 kg","reservoir":"16 L","hauteurSelle":"820 mm","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide","freinAvant":"Disque 300 mm, ABS","freinArriere":"Disque 240 mm, ABS","pneuAvant":"110/80 R19","pneuArriere":"150/70 R17","capaciteHuile":"1,9 L","normeEuro":"Euro 5"}'::jsonb,
   'moto_mono_trail'),
  ('voge', '500R', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"471 cm³","puissance":"47 ch (35 kW)","couple":"43 Nm","poids":"196 kg","reservoir":"16 L","hauteurSelle":"795 mm","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide","freinAvant":"Double disque, ABS","freinArriere":"Disque, ABS","pneuAvant":"120/70 R17","pneuArriere":"160/60 R17","capaciteHuile":"2,4 L","normeEuro":"Euro 5"}'::jsonb,
   'moto_bicylindre'),
  ('voge', '500 DS', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"471 cm³","puissance":"47 ch (35 kW)","couple":"43 Nm","poids":"204 kg","reservoir":"16,5 L","hauteurSelle":"825 mm","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide","freinAvant":"Double disque, ABS","freinArriere":"Disque, ABS","pneuAvant":"110/80 R19","pneuArriere":"150/70 R17","capaciteHuile":"2,4 L","normeEuro":"Euro 5"}'::jsonb,
   'moto_bicylindre'),
  ('voge', '525 DSX', 'motos', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"494 cm³","puissance":"47 ch (35 kW)","couple":"46,5 Nm","poids":"199 kg","reservoir":"16 L","hauteurSelle":"825 mm","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide","freinAvant":"Double disque 298 mm, ABS","freinArriere":"Disque 240 mm, ABS","pneuAvant":"110/80 R19","pneuArriere":"150/70 R17","capaciteHuile":"2,4 L","normeEuro":"Euro 5+"}'::jsonb,
   'moto_bicylindre'),
  ('voge', '650 DSX', 'motos', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"652 cm³","puissance":"60 ch (44 kW)","couple":"61 Nm","poids":"214 kg","reservoir":"18 L","hauteurSelle":"840 mm","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide","freinAvant":"Double disque, ABS","freinArriere":"Disque, ABS","pneuAvant":"110/80 R19","pneuArriere":"150/70 R17","capaciteHuile":"2,6 L","normeEuro":"Euro 5+"}'::jsonb,
   'moto_bicylindre_grosse'),
  ('voge', '900 DSX', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"895 cm³","puissance":"95 ch (70 kW)","couple":"90 Nm","poids":"232 kg","reservoir":"19 L","hauteurSelle":"850 mm","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide","freinAvant":"Double disque, ABS","freinArriere":"Disque, ABS","pneuAvant":"90/90 R21","pneuArriere":"150/70 R18","capaciteHuile":"3,2 L","normeEuro":"Euro 5+"}'::jsonb,
   'moto_bicylindre_grosse'),
  ('voge', 'Brivido 500R', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"471 cm³","puissance":"47 ch (35 kW)","couple":"43 Nm","poids":"195 kg","reservoir":"16 L","hauteurSelle":"800 mm","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide","freinAvant":"Double disque, ABS","freinArriere":"Disque, ABS","pneuAvant":"120/70 R17","pneuArriere":"160/60 R17","capaciteHuile":"2,4 L","normeEuro":"Euro 5"}'::jsonb,
   'moto_bicylindre'),
  ('voge', 'SR1 125', 'scooters', '{2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"125 cm³","puissance":"11 ch (8,3 kW)","couple":"10,8 Nm","poids":"126 kg","reservoir":"7 L","hauteurSelle":"780 mm","transmission":"Variateur CVT","refroidissement":"Liquide","freinAvant":"Disque, ABS","freinArriere":"Disque, CBS","pneuAvant":"110/70 R13","pneuArriere":"130/70 R13","capaciteHuile":"1,1 L","normeEuro":"Euro 5"}'::jsonb,
   'scooter_cvt_petit'),
  ('voge', 'SR4 Max 350', 'scooters', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"330 cm³","puissance":"29 ch (21,5 kW)","couple":"31 Nm","poids":"189 kg","reservoir":"13,5 L","hauteurSelle":"775 mm","transmission":"Variateur CVT","refroidissement":"Liquide","freinAvant":"Double disque, ABS","freinArriere":"Disque, ABS","pneuAvant":"120/70 R15","pneuArriere":"150/70 R14","capaciteHuile":"1,4 L","normeEuro":"Euro 5+"}'::jsonb,
   'scooter_cvt_gt'),
  ('voge', 'SR16 125', 'scooters', '{2024,2025,2026}'::int[],
   '{"cylindree":"125 cm³","puissance":"11 ch (8,3 kW)","couple":"10,4 Nm","poids":"122 kg","reservoir":"6,5 L","hauteurSelle":"770 mm","transmission":"Variateur CVT","refroidissement":"Liquide","freinAvant":"Disque, ABS","freinArriere":"Disque, CBS","pneuAvant":"100/80 R16","pneuArriere":"120/80 R16","capaciteHuile":"1,0 L","normeEuro":"Euro 5+"}'::jsonb,
   'scooter_cvt_petit'),

  -- ═══ KAWASAKI — motos ═══
  ('kawasaki', 'Z500', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"451 cm³","puissance":"45 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_bicylindre'),
  ('kawasaki', 'Z650', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"649 cm³","puissance":"68 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_bicylindre'),
  ('kawasaki', 'Z900', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"948 cm³","puissance":"125 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_4cylindres'),
  ('kawasaki', 'Z900RS', 'motos', '{2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"948 cm³","puissance":"111 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_4cylindres'),
  ('kawasaki', 'Ninja 500', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"451 cm³","puissance":"45 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_bicylindre'),
  ('kawasaki', 'Ninja 650', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"649 cm³","puissance":"68 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_bicylindre'),
  ('kawasaki', 'Ninja ZX-6R', 'motos', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"636 cm³","puissance":"124 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_4cylindres'),
  ('kawasaki', 'Ninja 1000SX', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1043 cm³","puissance":"142 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_4cylindres'),
  ('kawasaki', 'Versys 650', 'motos', '{2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"649 cm³","puissance":"66 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_bicylindre'),
  ('kawasaki', 'Versys 1000', 'motos', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1043 cm³","puissance":"120 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_4cylindres'),
  ('kawasaki', 'Vulcan S', 'motos', '{2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"649 cm³","puissance":"61 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_bicylindre'),
  ('kawasaki', 'W800', 'motos', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"773 cm³","puissance":"48 ch","transmission":"Chaîne, 5 rapports","refroidissement":"Air"}'::jsonb,
   'moto_jap_bicylindre'),
  ('kawasaki', 'Eliminator 500', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"451 cm³","puissance":"45 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_bicylindre'),
  ('kawasaki', 'KLX230', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"233 cm³","puissance":"19 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Air"}'::jsonb,
   'moto_mono_trail'),

  -- ═══ KAWASAKI — quads ═══
  ('kawasaki', 'KFX90', 'quads', '{2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"90 cm³","transmission":"Variateur CVT","refroidissement":"Air"}'::jsonb,
   'quad_loisir'),
  ('kawasaki', 'Brute Force 300', 'quads', '{2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"271 cm³","transmission":"Variateur CVT","refroidissement":"Liquide"}'::jsonb,
   'quad_loisir'),
  ('kawasaki', 'Brute Force 750 4x4i', 'quads', '{2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"749 cm³","transmission":"Variateur CVT, 4x4","refroidissement":"Liquide"}'::jsonb,
   'quad_utilitaire'),

  -- ═══ SUZUKI — motos ═══
  ('suzuki', 'SV650', 'motos', '{2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"645 cm³","puissance":"73 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_bicylindre'),
  ('suzuki', 'GSX-8S', 'motos', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"776 cm³","puissance":"83 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_bicylindre'),
  ('suzuki', 'GSX-8R', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"776 cm³","puissance":"83 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_bicylindre'),
  ('suzuki', 'V-Strom 650', 'motos', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"645 cm³","puissance":"71 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_bicylindre'),
  ('suzuki', 'V-Strom 800DE', 'motos', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"776 cm³","puissance":"84 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_bicylindre'),
  ('suzuki', 'V-Strom 1050', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1037 cm³","puissance":"107 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_bicylindre'),
  ('suzuki', 'GSX-S1000', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"999 cm³","puissance":"152 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_4cylindres'),
  ('suzuki', 'GSX-S1000GT', 'motos', '{2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"999 cm³","puissance":"152 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_4cylindres'),
  ('suzuki', 'Hayabusa', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"1340 cm³","puissance":"190 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_jap_4cylindres'),

  -- ═══ SUZUKI — scooters ═══
  ('suzuki', 'Address 125', 'scooters', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"124 cm³","transmission":"Variateur CVT","refroidissement":"Air"}'::jsonb,
   'scooter_cvt_petit'),
  ('suzuki', 'Avenis 125', 'scooters', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"124 cm³","transmission":"Variateur CVT","refroidissement":"Air"}'::jsonb,
   'scooter_cvt_petit'),
  ('suzuki', 'Burgman 400', 'scooters', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"400 cm³","puissance":"29 ch","transmission":"Variateur CVT","refroidissement":"Liquide"}'::jsonb,
   'scooter_cvt_gt'),

  -- ═══ SUZUKI — quads ═══
  ('suzuki', 'KingQuad 400', 'quads', '{2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"376 cm³","transmission":"CVT, 4x4","refroidissement":"Air/huile"}'::jsonb,
   'quad_utilitaire'),
  ('suzuki', 'KingQuad 500', 'quads', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"493 cm³","transmission":"CVT, 4x4","refroidissement":"Liquide"}'::jsonb,
   'quad_utilitaire'),
  ('suzuki', 'KingQuad 750', 'quads', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"722 cm³","transmission":"CVT, 4x4","refroidissement":"Liquide"}'::jsonb,
   'quad_utilitaire'),

  -- ═══ CF MOTO — motos ═══
  ('cf-moto', '450SR', 'motos', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"449 cm³","puissance":"47 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_bicylindre'),
  ('cf-moto', '450MT', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"449 cm³","puissance":"44 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_bicylindre'),
  ('cf-moto', '450NK', 'motos', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"449 cm³","puissance":"47 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_bicylindre'),
  ('cf-moto', '700CL-X', 'motos', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"693 cm³","puissance":"74 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_bicylindre_grosse'),
  ('cf-moto', '800MT', 'motos', '{2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"799 cm³","puissance":"95 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_bicylindre_grosse'),
  ('cf-moto', '800NK', 'motos', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"799 cm³","puissance":"101 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_bicylindre_grosse'),

  -- ═══ CF MOTO — quads ═══
  ('cf-moto', 'CFORCE 450', 'quads', '{2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"400 cm³","transmission":"CVT, 4x4","refroidissement":"Liquide"}'::jsonb,
   'quad_utilitaire'),
  ('cf-moto', 'CFORCE 520', 'quads', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"495 cm³","transmission":"CVT, 4x4","refroidissement":"Liquide"}'::jsonb,
   'quad_utilitaire'),
  ('cf-moto', 'CFORCE 625', 'quads', '{2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"580 cm³","transmission":"CVT, 4x4","refroidissement":"Liquide"}'::jsonb,
   'quad_utilitaire'),
  ('cf-moto', 'CFORCE 850', 'quads', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"800 cm³","transmission":"CVT, 4x4","refroidissement":"Liquide"}'::jsonb,
   'quad_utilitaire'),
  ('cf-moto', 'CFORCE 1000', 'quads', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"963 cm³","transmission":"CVT, 4x4","refroidissement":"Liquide"}'::jsonb,
   'quad_utilitaire'),

  -- ═══ ZONTES — motos ═══
  ('zontes', 'ZT125-U', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"125 cm³","puissance":"15 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_mono_petite'),
  ('zontes', 'ZT125-G1', 'motos', '{2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"125 cm³","puissance":"15 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_mono_petite'),
  ('zontes', 'ZT310-R', 'motos', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"312 cm³","puissance":"36 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_mono_petite'),
  ('zontes', 'ZT310-T', 'motos', '{2019,2020,2021,2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"312 cm³","puissance":"36 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_mono_trail'),
  ('zontes', '350R', 'motos', '{2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"348 cm³","puissance":"39 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_mono_petite'),
  ('zontes', '350T ADV', 'motos', '{2022,2023,2024,2025,2026}'::int[],
   '{"cylindree":"348 cm³","puissance":"39 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_mono_trail'),
  ('zontes', '703F ADV', 'motos', '{2024,2025,2026}'::int[],
   '{"cylindree":"699 cm³","puissance":"95 ch","transmission":"Chaîne, 6 rapports","refroidissement":"Liquide"}'::jsonb,
   'moto_bicylindre_grosse'),

  -- ═══ ZONTES — scooters ═══
  ('zontes', '350D', 'scooters', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"348 cm³","puissance":"38 ch","transmission":"Variateur CVT","refroidissement":"Liquide"}'::jsonb,
   'scooter_cvt_gt'),
  ('zontes', '350E', 'scooters', '{2023,2024,2025,2026}'::int[],
   '{"cylindree":"348 cm³","puissance":"38 ch","transmission":"Variateur CVT","refroidissement":"Liquide"}'::jsonb,
   'scooter_cvt_gt')

) AS m(brand_slug, name, category, years, specs, profile_key)
JOIN public.catalog_brands b ON b.slug = m.brand_slug
JOIN public.catalog_maintenance_profiles p ON p.key = m.profile_key
ON CONFLICT (brand_id, category, name) DO NOTHING;
