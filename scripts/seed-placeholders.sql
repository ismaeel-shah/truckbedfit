-- LOCAL DEV ONLY. Three placeholder posts so the navbar, category page, truck hubs and
-- shortcodes have something to render. Every title starts with "[PLACEHOLDER]" and the body is
-- lorem ipsum — none of it is real product information.
--   Seed:   npm run db:seed-placeholders:local
--   Remove: npm run db:remove-placeholders:local
-- Never run this against the remote database.

INSERT OR REPLACE INTO posts (
  id, title, slug, excerpt, content, category_id, status, published_at,
  reading_time, meta_title, meta_description, focus_keyword, type, trucks_json, updated_on,
  faqs_json, created_at, updated_at
) VALUES
(
  'placeholder-pillar', '[PLACEHOLDER] Tonneau Covers', 'tonneau-covers',
  'Placeholder pillar intro. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>'
  || '<p>[trustbox]</p>'
  || '<h2>Placeholder section one</h2><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>'
  || '<h2>Bed sizes</h2><p>[bedchart]</p>'
  || '<h2>Placeholder section two</h2><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>',
  'cat-tonneau-covers', 'published', '2026-10-20T09:00:00.000Z',
  3, '', 'Placeholder description for the tonneau covers pillar page.', 'tonneau covers',
  'pillar', '[]', '2026-10-20',
  '[{"question":"Placeholder question one?","answer":"Lorem ipsum placeholder answer."}]',
  '2026-10-20T09:00:00.000Z', '2026-10-20T09:00:00.000Z'
),
(
  'placeholder-f150', '[PLACEHOLDER] Best Tonneau Covers for Ford F-150', 'best-tonneau-covers-ford-f-150',
  'Placeholder best-list for one truck. Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>'
  || '<p>[toppick label="Best overall" name="[PLACEHOLDER] Cover A" asin="B0PLACEHL1" note="Placeholder reason one."]</p>'
  || '<p>[toppick label="Best budget" name="[PLACEHOLDER] Cover B" asin="B0PLACEHL2" note="Placeholder reason two, a little longer so the cards differ in height."]</p>'
  || '<p>[toppick label="Best for short beds" name="[PLACEHOLDER] Cover C" asin="B0PLACEHL3" note="Placeholder reason three."]</p>'
  || '<p>[trustbox]</p>'
  || '<h2>Placeholder pick</h2>'
  || '<p>[productbox name="[PLACEHOLDER] Example Cover" asin="B0PLACEHL1" bullets="Placeholder point one|Placeholder point two|Placeholder point three"]</p>'
  || '<p>Curabitur blandit tempus porttitor. Maecenas faucibus mollis interdum.</p>'
  || '<h2>Bed sizes</h2><p>[bedchart trucks="ford-f-150"]</p>',
  'cat-tonneau-covers', 'published', '2026-10-19T09:00:00.000Z',
  2, 'Best Tonneau Covers for Ford F-150 ({year})', 'Placeholder description for an F-150 best-list.', 'best tonneau covers for ford f-150',
  'best-list-vehicle', '["ford-f-150"]', '2026-10-19',
  '[]',
  '2026-10-19T09:00:00.000Z', '2026-10-19T09:00:00.000Z'
),
(
  'placeholder-guide', '[PLACEHOLDER] How to Measure a Truck Bed', 'how-to-measure-truck-bed-for-tonneau-cover',
  'Placeholder guide tagged to several trucks. Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula.</p>'
  || '<h2>Placeholder step one</h2><p>Vestibulum id ligula porta felis euismod semper.</p>'
  || '<h2>Placeholder step two</h2><p>Cras mattis consectetur purus sit amet fermentum.</p>'
  || '<h2>Bed sizes</h2><p>[bedchart trucks="ford-f-150,chevy-silverado-1500,ram-1500"]</p>',
  'cat-tonneau-covers', 'published', '2026-10-18T09:00:00.000Z',
  2, '', 'Placeholder description for a measuring guide.', 'how to measure truck bed',
  'guide', '["ford-f-150","chevy-silverado-1500","ram-1500"]', '2026-10-18',
  '[]',
  '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
);
