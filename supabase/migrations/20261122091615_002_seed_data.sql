/*
# Seed Data — Categories, Products, Add-ons, Coupons

## Overview
Populates the database with a starter catalog for Shan's Bakery:
6 categories and 24 products with images, add-ons, and 2 sample coupons.

## Data inserted
- Categories: Cakes, Cupcakes, Brownies, Pastries, Cookies, Gift Hampers
- Products: 24 items across categories with realistic prices, descriptions, weights, ratings
- Product add-ons: candles, greeting cards, gift wrap for cake products
- Coupons: WELCOME10 (10% off, min ₹500), FESTIVE50 (₹50 off, min ₹800)
- All image URLs use Unsplash source URLs (real, working images)

## Security
No security changes — this is data only. RLS policies already allow public reads.
*/

-- =============================================
-- CATEGORIES
-- =============================================
INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES
('Cakes', 'cakes', 'Custom celebration cakes baked fresh — birthday, anniversary, wedding and themed cakes.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9583?w=600&q=80', 1),
('Cupcakes', 'cupcakes', 'Mini treats in classic and creative flavours, perfect for parties and gifting.', 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&q=80', 2),
('Brownies', 'brownies', 'Rich, fudgy brownies with crackly tops and gooey centres.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80', 3),
('Pastries', 'pastries', 'Flaky croissants, tarts, danishes and eclairs made with butter and care.', 'https://images.unsplash.com/photo-1517433670267-08711f3a7bff?w=600&q=80', 4),
('Cookies', 'cookies', 'Crunchy, chewy, and melt-in-your-mouth cookies in every flavour.', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80', 5),
('Gift Hampers', 'gift-hampers', 'Curated gift boxes and hampers for every celebration and occasion.', 'https://images.unsplash.com/photo-1519549704000-6f3e8d0e95e8?w=600&q=80', 6)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- PRODUCTS — Cakes
-- =============================================
INSERT INTO products (category_id, name, slug, description, long_description, base_price, compare_at_price, weight_label, image_url, gallery, rating, review_count, is_featured, is_bestseller, stock) VALUES
((SELECT id FROM categories WHERE slug='cakes'), 'Classic Chocolate Truffle Cake', 'classic-chocolate-truffle-cake',
 'Moist chocolate sponge layered with rich ganache and chocolate shards.',
 'Our signature chocolate truffle cake features three layers of moist Belgian chocolate sponge, filled and covered with silky dark chocolate ganache. Finished with hand-piped chocolate rosettes and dark chocolate shards. Available in egg or eggless variants.',
 699, 899, '500 g',
 'https://images.unsplash.com/photo-1578985545062-69928b1d9583?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1578985545062-69928b1d9583?w=800&q=80','https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&q=80','https://images.unsplash.com/photo-1623215798858-ebe7d2903398?w=800&q=80'],
 4.8, 342, true, true, 50),

((SELECT id FROM categories WHERE slug='cakes'), 'Vanilla Berry Birthday Cake', 'vanilla-berry-birthday-cake',
 'Vanilla sponge with fresh cream, berry compote and colourful sprinkles.',
 'A festive vanilla sponge layered with whipped cream and mixed berry compote, covered in smooth buttercream and decorated with colourful sprinkles and fresh berries. Perfect for birthdays and celebrations.',
 749, 950, '500 g',
 'https://images.unsplash.com/photo-1464195244916-405fa0e6d80b?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1464195244916-405fa0e6d80b?w=800&q=80','https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800&q=80'],
 4.7, 218, true, true, 40),

((SELECT id FROM categories WHERE slug='cakes'), 'Red Velvet Cream Cheese Cake', 'red-velvet-cream-cheese-cake',
 'Classic red velvet with tangy cream cheese frosting and velvet crumbs.',
 'Deep red cocoa sponge layered with smooth cream cheese frosting. The sponge has a tender, velvet-like crumb and a hint of cocoa. Decorated with velvet crumbs and white chocolate curls.',
 799, 999, '500 g',
 'https://images.unsplash.com/photo-1586985289688-ca3cf47d0678?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1586985289688-ca3cf47d0678?w=800&q=80','https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80'],
 4.9, 287, true, true, 35),

((SELECT id FROM categories WHERE slug='cakes'), 'Pineapple Caramel Cake', 'pineapple-caramel-cake',
 'Caramelised pineapple rings with buttery sponge and salted caramel drizzle.',
 'A tropical delight featuring caramelised pineapple rings on a buttery sponge, layered with whipped cream and finished with salted caramel drizzle. A perfect balance of sweet and tangy.',
 649, 825, '500 g',
 'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1607478900766-efe13248b125?w=800&q=80'],
 4.6, 156, false, false, 30),

((SELECT id FROM categories WHERE slug='cakes'), 'Black Forest Gateau', 'black-forest-gateau',
 'Chocolate sponge with cherries, kirsch syrup and whipped cream rosettes.',
 'A classic Black Forest gateau with layers of chocolate sponge soaked in cherry syrup, filled with whipped cream and morello cherries, decorated with chocolate shavings and cream rosettes.',
 749, 925, '500 g',
 'https://images.unsplash.com/photo-1565808289208-ec6106d78b46?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1565808289208-ec6106d78b46?w=800&q=80'],
 4.7, 198, false, true, 28),

((SELECT id FROM categories WHERE slug='cakes'), 'Butterscotch Praline Cake', 'butterscotch-praline-cake',
 'Butterscotch sponge with crunchy praline pieces and caramel cream.',
 'A rich butterscotch sponge layered with caramel cream and studded with crunchy praline pieces. Topped with butterscotch sauce and crushed praline for the perfect crunch in every bite.',
 699, 875, '500 g',
 'https://images.unsplash.com/photo-1602351447937-745e72076521?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1602351447937-745e72076521?w=800&q=80'],
 4.5, 134, false, false, 25),

-- =============================================
-- PRODUCTS — Cupcakes
-- =============================================
((SELECT id FROM categories WHERE slug='cupcakes'), 'Assorted Cupcake Box (6)', 'assorted-cupcake-box-6',
 'Six assorted mini cupcakes — vanilla, chocolate, red velvet and more.',
 'A delightful box of six assorted cupcakes featuring vanilla bean, double chocolate, red velvet, strawberry, lemon and cookies-and-cream. Each is hand-decorated with swirls of buttercream.',
 349, 450, '6 pieces',
 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&q=80','https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800&q=80'],
 4.8, 412, true, true, 60),

((SELECT id FROM categories WHERE slug='cupcakes'), 'Chocolate Overload Cupcakes (4)', 'chocolate-overload-cupcakes-4',
 'Four rich chocolate cupcakes with ganache frosting and chocolate chips.',
 'For the chocolate lover — four deep chocolate cupcakes topped with dark chocolate ganache, chocolate chips and a chocolate drizzle. Dense, fudgy and utterly indulgent.',
 299, 399, '4 pieces',
 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&q=80'],
 4.7, 267, false, true, 45),

((SELECT id FROM categories WHERE slug='cupcakes'), 'Red Velvet Cupcakes (4)', 'red-velvet-cupcakes-4',
 'Four red velvet cupcakes with swirls of cream cheese frosting.',
 'Four tender red velvet cupcakes topped with tangy cream cheese frosting and a sprinkle of red velvet crumbs. The perfect mini indulgence.',
 329, 420, '4 pieces',
 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800&q=80'],
 4.6, 189, false, false, 40),

-- =============================================
-- PRODUCTS — Brownies
-- =============================================
((SELECT id FROM categories WHERE slug='brownies'), 'Classic Fudge Brownies (6)', 'classic-fudge-brownies-6',
 'Six dense, fudgy brownies with crackly tops and gooey centres.',
 'Our classic fudge brownies are baked low and slow for a dense, fudgy texture with a shiny crackly top and gooey centre. Made with 70% dark chocolate and real butter. Six generous pieces.',
 399, 525, '6 pieces',
 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80','https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80'],
 4.9, 521, true, true, 70),

((SELECT id FROM categories WHERE slug='brownies'), 'Walnut Caramel Brownies (6)', 'walnut-caramel-brownies-6',
 'Six fudgy brownies with toasted walnuts and salted caramel swirls.',
 'Rich chocolate brownies loaded with toasted walnuts and swirled with salted caramel. The perfect balance of crunchy, gooey, sweet and salty. Six generous pieces.',
 449, 575, '6 pieces',
 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80'],
 4.7, 298, true, false, 50),

((SELECT id FROM categories WHERE slug='brownies'), 'Blondies White Chocolate (6)', 'blondies-white-chocolate-6',
 'Six golden blondies with white chocolate chunks and macadamia nuts.',
 'A lighter alternative to brownies — golden blondies packed with white chocolate chunks and toasted macadamia nuts. Buttery, chewy and completely addictive. Six pieces.',
 379, 475, '6 pieces',
 'https://images.unsplash.com/photo-1612203985729-70726954388c?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1612203985729-70726954388c?w=800&q=80'],
 4.5, 142, false, false, 35),

-- =============================================
-- PRODUCTS — Pastries
-- =============================================
((SELECT id FROM categories WHERE slug='pastries'), 'Assorted Pastry Box (8)', 'assorted-pastry-box-8',
 'Eight assorted pastries — black forest, pineapple, strawberry and chocolate.',
 'A curated box of eight assorted pastries including black forest, pineapple, strawberry cream, chocolate truffle, blueberry cheese and coffee hazelnut. Each pastry is individually decorated.',
 449, 599, '8 pieces',
 'https://images.unsplash.com/photo-1517433670267-08711f3a7bff?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1517433670267-08711f3a7bff?w=800&q=80'],
 4.7, 234, true, true, 45),

((SELECT id FROM categories WHERE slug='pastries'), 'Strawberry Cream Pastries (4)', 'strawberry-cream-pastries-4',
 'Four light vanilla pastries with fresh strawberry cream and glaze.',
 'Four airy vanilla sponge pastries filled with fresh strawberry cream and topped with a glossy strawberry glaze. Light, fruity and perfect with afternoon tea.',
 299, 399, '4 pieces',
 'https://images.unsplash.com/photo-1623215798858-ebe7d2903398?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1623215798858-ebe7d2903398?w=800&q=80'],
 4.6, 178, false, false, 30),

((SELECT id FROM categories WHERE slug='pastries'), 'Chocolate Eclairs (6)', 'chocolate-eclairs-6',
 'Six crisp choux eclairs filled with vanilla custard and dark chocolate glaze.',
 'Classic French eclairs — crisp choux pastry shells filled with smooth vanilla custard cream and topped with a dark chocolate glaze. Six pieces, best enjoyed chilled.',
 349, 449, '6 pieces',
 'https://images.unsplash.com/photo-1612203985729-70726954388c?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1612203985729-70726954388c?w=800&q=80'],
 4.7, 167, false, false, 28),

((SELECT id FROM categories WHERE slug='pastries'), 'Blueberry Cheese Tart', 'blueberry-cheese-tart',
 'Buttery tart shell with creamy cheese filling and wild blueberry compote.',
 'A buttery shortcrust shell filled with smooth cream cheese filling and topped with wild blueberry compote. Individual size, perfect for a sophisticated dessert.',
 249, 325, '1 piece',
 'https://images.unsplash.com/photo-1488477180522-6c42522e3e3e?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1488477180522-6c42522e3e3e?w=800&q=80'],
 4.5, 89, false, false, 20),

-- =============================================
-- PRODUCTS — Cookies
-- =============================================
((SELECT id FROM categories WHERE slug='cookies'), 'Choco Chip Cookie Box (12)', 'choco-chip-cookie-box-12',
 'Twelve classic butter cookies loaded with dark chocolate chips.',
 'Our bestselling cookies — twelve buttery cookies loaded with dark chocolate chips. Crisp on the edges, chewy in the centre, and baked fresh daily. A timeless treat.',
 299, 399, '12 pieces',
 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80','https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80'],
 4.8, 387, true, true, 80),

((SELECT id FROM categories WHERE slug='cookies'), 'Oatmeal Raisin Cookies (12)', 'oatmeal-raisin-cookies-12',
 'Twelve wholesome oatmeal cookies with plump raisins and cinnamon.',
 'Twelve wholesome oatmeal cookies packed with rolled oats, plump raisins and a hint of cinnamon. Soft-baked with a golden colour and home-style flavour.',
 279, 359, '12 pieces',
 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80'],
 4.5, 156, false, false, 50),

((SELECT id FROM categories WHERE slug='cookies'), 'Almond Butter Cookies (12)', 'almond-butter-cookies-12',
 'Twelve delicate almond butter cookies with a sugar crust and almond topping.',
 'Twelve delicate melt-in-your-mouth almond butter cookies, topped with sliced almonds and a dusting of sugar. Buttery, nutty and perfect with coffee.',
 329, 425, '12 pieces',
 'https://images.unsplash.com/photo-1552052765-41dd3c63d3ba?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1552052765-41dd3c63d3ba?w=800&q=80'],
 4.6, 112, false, false, 40),

-- =============================================
-- PRODUCTS — Gift Hampers
-- =============================================
((SELECT id FROM categories WHERE slug='gift-hampers'), 'Celebration Gift Hamper', 'celebration-gift-hamper',
 'Assorted cakes, cookies and brownies in a premium gift box with ribbon.',
 'The ultimate celebration hamper — assorted cake slices, a box of choco chip cookies, six fudge brownies and a jar of chocolate truffle, beautifully packed in a premium gift box with satin ribbon.',
 1299, 1699, 'Gift box',
 'https://images.unsplash.com/photo-1519549704000-6f3e8d0e95e8?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1519549704000-6f3e8d0e95e8?w=800&q=80'],
 4.9, 145, true, true, 20),

((SELECT id FROM categories WHERE slug='gift-hampers'), 'Festive Dry Fruit & Cookies Hamper', 'festive-dry-fruit-cookies-hamper',
 'Premium dry fruits paired with assorted cookies in a festive gift box.',
 'A festive hamper featuring premium roasted almonds, cashews and pistachios paired with assorted cookies (choco chip, oatmeal raisin and almond butter). Elegantly packed for gifting.',
 999, 1299, 'Gift box',
 'https://images.unsplash.com/photo-1546484959-f9a381d1330f?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1546484959-f9a381d1330f?w=800&q=80'],
 4.7, 98, false, false, 15),

((SELECT id FROM categories WHERE slug='gift-hampers'), 'Sweet Tooth Hamper', 'sweet-tooth-hamper',
 'Brownies, cupcakes and cookies combo for the ultimate sugar rush.',
 'A sweet tooth''s dream — six fudge brownies, four assorted cupcakes and a box of choco chip cookies, all in a colourful gift box. Perfect for sharing (or not).',
 899, 1199, 'Gift box',
 'https://images.unsplash.com/photo-1606768668250-97c2906e7816?w=800&q=80',
 ARRAY['https://images.unsplash.com/photo-1606768668250-97c2906e7816?w=800&q=80'],
 4.8, 167, false, true, 18)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- PRODUCT ADDONS (for cake products)
-- =============================================
INSERT INTO product_addons (product_id, name, price) VALUES
((SELECT id FROM products WHERE slug='classic-chocolate-truffle-cake'), 'Birthday Candles (set of 6)', 49),
((SELECT id FROM products WHERE slug='classic-chocolate-truffle-cake'), 'Greeting Card', 39),
((SELECT id FROM products WHERE slug='classic-chocolate-truffle-cake'), 'Gift Wrap', 79),
((SELECT id FROM products WHERE slug='vanilla-berry-birthday-cake'), 'Birthday Candles (set of 6)', 49),
((SELECT id FROM products WHERE slug='vanilla-berry-birthday-cake'), 'Greeting Card', 39),
((SELECT id FROM products WHERE slug='vanilla-berry-birthday-cake'), 'Gift Wrap', 79),
((SELECT id FROM products WHERE slug='red-velvet-cream-cheese-cake'), 'Birthday Candles (set of 6)', 49),
((SELECT id FROM products WHERE slug='red-velvet-cream-cheese-cake'), 'Greeting Card', 39),
((SELECT id FROM products WHERE slug='red-velvet-cream-cheese-cake'), 'Gift Wrap', 79),
((SELECT id FROM products WHERE slug='pineapple-caramel-cake'), 'Birthday Candles (set of 6)', 49),
((SELECT id FROM products WHERE slug='pineapple-caramel-cake'), 'Greeting Card', 39),
((SELECT id FROM products WHERE slug='black-forest-gateau'), 'Birthday Candles (set of 6)', 49),
((SELECT id FROM products WHERE slug='black-forest-gateau'), 'Greeting Card', 39),
((SELECT id FROM products WHERE slug='butterscotch-praline-cake'), 'Birthday Candles (set of 6)', 49),
((SELECT id FROM products WHERE slug='butterscotch-praline-cake'), 'Greeting Card', 39);

-- =============================================
-- COUPONS
-- =============================================
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, valid_until, is_active) VALUES
('WELCOME10', '10% off on your first order above ₹500', 'percentage', 10, 500, 200, 1000, '2027-12-31', true),
('FESTIVE50', 'Flat ₹50 off on orders above ₹800', 'fixed', 50, 800, NULL, 500, '2027-12-31', true),
('SHAN15', '15% off on orders above ₹1000', 'percentage', 15, 1000, 300, 500, '2027-12-31', true)
ON CONFLICT (code) DO NOTHING;
