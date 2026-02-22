const dresses = [
  {
    id: 1,
    name: 'فستان أسود',
    nameEn: 'Black Dress',
    category: 'evening',
    price: 35,
    material: 'قماش حريري فاخر مع خط ذهبي ناعم. يتميز بملمس ناعم وانسيابي مريح للارتداء طوال اليوم',
    materialEn: 'Luxurious silk fabric with fine gold thread. Features a soft, silky and comfortable feel for all-day wear',
    sizes: [38,40,42,44,46,48,50],
    sizeChart: [
      { size: 38, height: '160-165', weight: '50-55', waist: '60', chest: '80' },
      { size: 40, height: '160-165', weight: '55-60', waist: '62', chest: '82' },
      { size: 42, height: '165-170', weight: '60-65', waist: '64', chest: '84' },
      { size: 44, height: '165-170', weight: '65-70', waist: '66', chest: '86' },
      { size: 46, height: '170-175', weight: '70-75', waist: '68', chest: '88' },
      { size: 48, height: '170-175', weight: '75-80', waist: '70', chest: '90' },
      { size: 50, height: '175+', weight: '80+', waist: '72', chest: '92' }
    ],
    colors: [
      { name: 'أسود', nameEn: 'Black', far: '/dresses/d3-black.jpg', close: '/dresses/d3-zblack.jpg', bgColor:'#000' },
      { name: 'أحمر', nameEn: 'Red', far: '/dresses/d3-5amre.jpg', close: '/dresses/d3-zati.jpg', bgColor:'#ff4d4d' },
      { name: 'أزرق', nameEn: 'Blue', far: '/dresses/d3-baj.jpg', close: '/dresses/d3-zbaj.jpg', bgColor:'#0000ff' },
      { name: 'أصفر', nameEn: 'Yellow', far: '/dresses/d3-5amre.jpg', close: '/dresses/d3-zati.jpg', bgColor:'#ffff00' }
    ]
  },
  {
    id: 2,
    name: 'فستان العباي',
    nameEn: 'Abaya Dress',
    category: 'evening',
    price: 35,
    material: 'قماش عباية فاخر مع تطريزات يدوية جميلة. خفيف الوزن وتهويته عالية',
    materialEn: 'Luxurious abaya fabric with beautiful hand embroidery. Lightweight with excellent ventilation',
    sizes: [38,40,42,44,46,48,50],
    sizeChart: [
      { size: 38, height: '160-165', weight: '50-55', waist: '60', chest: '80' },
      { size: 40, height: '160-165', weight: '55-60', waist: '62', chest: '82' },
      { size: 42, height: '165-170', weight: '60-65', waist: '64', chest: '84' },
      { size: 44, height: '165-170', weight: '65-70', waist: '66', chest: '86' },
      { size: 46, height: '170-175', weight: '70-75', waist: '68', chest: '88' },
      { size: 48, height: '170-175', weight: '75-80', waist: '70', chest: '90' },
      { size: 50, height: '175+', weight: '80+', waist: '72', chest: '92' }
    ],
    colors: [
      { name: 'وردي', nameEn: 'Pink', far: '/dresses/dress1-pink.jpg', close: '/dresses/dress1-pink.jpg', bgColor:'#FFC0CB' },
      { name: 'أزرق', nameEn: 'Blue', far: '/dresses/dress1-blue.jpg', close: '/dresses/dress1-blue.jpg', bgColor:'#0000FF' },
      { name: 'أسود', nameEn: 'Black', far: '/dresses/dress1-black.jpg', close: '/dresses/dress1-black.jpg', bgColor:'#000000' },
      { name: 'أزرق فاتح', nameEn: 'Baby Blue', far: '/dresses/dress1-babyblue.jpg', close: '/dresses/dress1-babyblue.jpg', bgColor:'#87CEFA' }
    ]
  },
  {
    id: 3,
    name: 'فستان شتوي ازرار',
    nameEn: 'Buttoned Winter Dress',
    category: 'winter',
    price: 22,
    material: 'قماش دافئ سميك مع طبقة داخلية ناعمة. مثالي للطقس البارد والشتاء',
    materialEn: 'Warm thick fabric with soft inner lining. Perfect for cold and winter weather',
    sizes: [38,40,42,44,46,48,50],
    sizeChart: [
      { size: 38, height: '160-165', weight: '50-55', waist: '60', chest: '80' },
      { size: 40, height: '160-165', weight: '55-60', waist: '62', chest: '82' },
      { size: 42, height: '165-170', weight: '60-65', waist: '64', chest: '84' },
      { size: 44, height: '165-170', weight: '65-70', waist: '66', chest: '86' },
      { size: 46, height: '170-175', weight: '70-75', waist: '68', chest: '88' },
      { size: 48, height: '170-175', weight: '75-80', waist: '70', chest: '90' },
      { size: 50, height: '175+', weight: '80+', waist: '72', chest: '92' }
    ],
    colors: [
      { name: 'خمري', nameEn: 'Burgundy', far: '/dresses/azrar-5amre.jpg', close: '/dresses/azrar-z5amre.jpg', bgColor:'#4c1313' },
      { name: 'بيج', nameEn: 'Beige', far: '/dresses/azrar-baj.jpg', close: '/dresses/azrar-baj.jpg', bgColor:'#a8895f' },
      { name: 'بني', nameEn: 'Brown', far: '/dresses/azrar-beni.jpg', close: '/dresses/azrar-beni.jpg', bgColor:'#241e15' },
      { name: 'أسود', nameEn: 'Black', far: '/dresses/azrar-black.jpg', close: '/dresses/azrar-black.jpg', bgColor:'#000000' },
      { name: 'سكري', nameEn: 'Cream', far: '/dresses/azrar-skari.jpg', close: '/dresses/azrar-skari.jpg', bgColor:'#d0bdb2' },
      { name: 'زيتي', nameEn: 'Olive', far: '/dresses/azrar-zeti.jpg', close: '/dresses/azrar-zeti.jpg', bgColor:'#0b1b09' }
    ]
  },
  {
    id: 4,
    name: 'فستان سهرة برّاق',
    nameEn: 'Glittering Evening Dress',
    category: 'evening',
    price: 55,
    material: 'قماش براق فاخر مع خيوط معدنية لامعة. يعكس الضوء بجمال ويناسب الحفلات الكبرى',
    materialEn: 'Luxurious sparkly fabric with shiny metallic threads. Reflects light beautifully for grand occasions',
    sizes: [38,40,42,44,46,48,50],
    sizeChart: [
      { size: 38, height: '160-165', weight: '50-55', waist: '60', chest: '80' },
      { size: 40, height: '160-165', weight: '55-60', waist: '62', chest: '82' },
      { size: 42, height: '165-170', weight: '60-65', waist: '64', chest: '84' },
      { size: 44, height: '165-170', weight: '65-70', waist: '66', chest: '86' },
      { size: 46, height: '170-175', weight: '70-75', waist: '68', chest: '88' },
      { size: 48, height: '170-175', weight: '75-80', waist: '70', chest: '90' },
      { size: 50, height: '175+', weight: '80+', waist: '72', chest: '92' }
    ],
    colors: [
      { name: 'ذهبي', nameEn: 'Gold', far: '/dresses/dress4-gold.jpg', close: '/dresses/dress4-gold-close.jpg', bgColor:'#FFD700' },
      { name: 'أسود', nameEn: 'Black', far: '/dresses/dress4-black.jpg', close: '/dresses/dress4-black-close.jpg', bgColor:'#000000' },
      { name: 'أزرق', nameEn: 'Blue', far: '/dresses/dress4-blue.jpg', close: '/dresses/dress4-blue-close.jpg', bgColor:'#0066CC' }
    ]
  },
   {
    id: 10,
    name: 'فستان حريم السلطان ',
    nameEn: 'Sultan\'s Harem Dress',
    category: 'evening',
    price: 55,
    material: 'قماش براق فاخر مع خيوط معدنية لامعة. يعكس الضوء بجمال ويناسب الحفلات الكبرى',
    materialEn: 'Luxurious sparkly fabric with shiny metallic threads. Reflects light beautifully for grand occasions',
    embroideryOptions: [
      { id: 'roses', name: 'تطريز على شكل ورود', nameEn: 'Rose embroidery' },
      { id: 'diamonds', name: 'تطريز على شكل الماس', nameEn: 'Diamond embroidery' }
    ],
    sizes: [38,40,42,44,46,48,50],
    sizeChart: [
      { size: 38, height: '160-165', weight: '50-55', waist: '60', chest: '80' },
      { size: 40, height: '160-165', weight: '55-60', waist: '62', chest: '82' },
      { size: 42, height: '165-170', weight: '60-65', waist: '64', chest: '84' },
      { size: 44, height: '165-170', weight: '65-70', waist: '66', chest: '86' },
      { size: 46, height: '170-175', weight: '70-75', waist: '68', chest: '88' },
      { size: 48, height: '170-175', weight: '75-80', waist: '70', chest: '90' },
      { size: 50, height: '175+', weight: '80+', waist: '72', chest: '92' }
    ],
    colors: [
      { name: 'أخضر', nameEn: 'Green', far: '/dresses/dress10-green.jpg', close: '/dresses/dress10-green-close.jpg', bgColor:'#0d5d1f' },
      { name: 'أحمر', nameEn: 'Red', far: '/dresses/dress10-red.jpg', close: '/dresses/dress10-red-close.jpg', close2: '/dresses/dress10-red-close2.jpg', bgColor:'#881818' }
    
    ]
  },
  {
    id: 11,
    name: 'فستان سهرة سناسل',
    nameEn: 'Chain Evening Dress',
    category: 'evening',
    price: 60,
    material: 'قماش فاخر مع تطريزات سناسل براقة على الكتفين والصدر. تصميم أنيق وملكي يناسب المناسبات الكبرى',
    materialEn: 'Luxurious fabric with sparkling chain embellishments on shoulders and chest. Elegant and regal design perfect for grand occasions',
    sizes: [38,40,42,44,46,48,50],
    sizeChart: [
      { size: 38, height: '160-165', weight: '50-55', waist: '60', chest: '80' },
      { size: 40, height: '160-165', weight: '55-60', waist: '62', chest: '82' },
      { size: 42, height: '165-170', weight: '60-65', waist: '64', chest: '84' },
      { size: 44, height: '165-170', weight: '65-70', waist: '66', chest: '86' },
      { size: 46, height: '170-175', weight: '70-75', waist: '68', chest: '88' },
      { size: 48, height: '170-175', weight: '75-80', waist: '70', chest: '90' },
      { size: 50, height: '175+', weight: '80+', waist: '72', chest: '92' }
    ],
    colors: [
      { name: 'أحمر', nameEn: 'Red', far: '/dresses/chains-red-far.jpg', close: '/dresses/chains-red-close.jpg', bgColor:'#DC143C' },
      { name: 'أبيض', nameEn: 'White', far: '/dresses/chains-white-far.jpg', close: '/dresses/chains-white-close.jpg', bgColor:'#FFFFFF' }
    ]
  },
  {
    id: 12,
    name: 'جاكيت شتوي',
    nameEn: 'Winter Jacket',
    category: 'winter',
    price: 75,
    material: 'جاكيت كاب دافئ بتصميم أنيق. قماش ثقيل مناسب للشتاء مع ياقة عريضة وحزام. يناسب المناسبات والاستخدام اليومي',
    materialEn: 'Warm cape-style jacket with elegant design. Heavy winter fabric with wide lapels and tie-belt. Perfect for occasions and everyday wear',
    sizes: [38, 40, 42, 44, 46, 48, 50],
    sizeChart: [
      { size: 38, height: '160-165', weight: '50-55', waist: '60', chest: '80' },
      { size: 40, height: '160-165', weight: '55-60', waist: '62', chest: '82' },
      { size: 42, height: '165-170', weight: '60-65', waist: '64', chest: '84' },
      { size: 44, height: '165-170', weight: '65-70', waist: '66', chest: '86' },
      { size: 46, height: '170-175', weight: '70-75', waist: '68', chest: '88' },
      { size: 48, height: '170-175', weight: '75-80', waist: '70', chest: '90' },
      { size: 50, height: '175+', weight: '80+', waist: '72', chest: '92' }
    ],
    colors: [
      { name: 'أبيض', nameEn: 'White', far: '/dresses/jacket-white.jpg', close: '/dresses/jacket-white-close.jpg', bgColor: '#F5F5DC' },
      { name: 'بني', nameEn: 'Brown', far: '/dresses/jacket-brown.jpg', close: '/dresses/jacket-brown.jpg', bgColor: '#5D4037' },
      { name: 'رمادي', nameEn: 'Grey', far: '/dresses/jacket-grey.jpg', close: '/dresses/jacket-grey-close.jpg', bgColor: '#616161' }
    ]
  },
  {
    id: 13,
    name: 'طقم شتوي',
    nameEn: 'Winter Set',
    category: 'winter',
    price: 120,
    material: 'طقم شتوي كامل يتكون من 3 قطع: جاكيت طويل دافئ مع ياقة عريضة وحزام، بلوز حفر (بدون أكمام) عالي الرقبة، وبنطلون مريح. قماش دافئ وناعم مناسب للطقس البارد',
    materialEn: 'Complete winter set consisting of 3 pieces: long warm jacket with wide lapels and belt, sleeveless high-neck blouse, and comfortable pants. Warm and soft fabric perfect for cold weather',
    sizes: [38, 40, 42, 44, 46, 48, 50],
    sizeChart: [
      { size: 38, height: '160-165', weight: '50-55', waist: '60', chest: '80' },
      { size: 40, height: '160-165', weight: '55-60', waist: '62', chest: '82' },
      { size: 42, height: '165-170', weight: '60-65', waist: '64', chest: '84' },
      { size: 44, height: '165-170', weight: '65-70', waist: '66', chest: '86' },
      { size: 46, height: '170-175', weight: '70-75', waist: '68', chest: '88' },
      { size: 48, height: '170-175', weight: '75-80', waist: '70', chest: '90' },
      { size: 50, height: '175+', weight: '80+', waist: '72', chest: '92' }
    ],
    colors: [
      { name: 'خمري', nameEn: 'Burgundy', far: '/dresses/set-olive.jpg', close: '/dresses/set-olive.jpg', bgColor: '#800020' },
      { name: 'توتي', nameEn: 'Berry', far: '/dresses/set-burgundy.jpg', close: '/dresses/set-burgundy.jpg', bgColor: '#8B008B' },
      { name: 'أسود', nameEn: 'Black', far: '/dresses/set-black.jpg', close: '/dresses/set-black.jpg', bgColor: '#000000' },
      { name: 'زيتي', nameEn: 'Olive', far: '/dresses/set-berry.jpg', close: '/dresses/set-berry.jpg', bgColor: '#556B2F' }
    ]
  }
]

export default dresses
