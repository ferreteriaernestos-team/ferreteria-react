export const PRODUCTS = [
  { id:1,  name:'Taladro Inalámbrico DeWalt 20V MAX',  brand:'DeWalt',         price:249.99, oldPrice:349.99, rating:5, reviews:128, img:'https://images.unsplash.com/photo-1546827209-a218e99fdbe9?w=400&q=80', badge:'-29%',        inStock:true,  categoria:'Herramientas' },
  { id:2,  name:'Sierra Circular Makita 7-1/4"',       brand:'Makita',         price:189.99, oldPrice:239.99, rating:4, reviews:87,  img:'https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=400&q=80', badge:'-21%',        inStock:true,  categoria:'Herramientas' },
  { id:3,  name:'Juego de Llaves Stanley 5 Piezas',    brand:'Stanley',        price:45.99,  oldPrice:null,   rating:5, reviews:234, img:'https://images.unsplash.com/photo-1503788943072-cd614c3056cf?w=400&q=80', badge:null,          inStock:true,  categoria:'Herramientas' },
  { id:4,  name:'Amoladora Angular Bosch 4-1/2"',      brand:'Bosch',          price:129.99, oldPrice:159.99, rating:4, reviews:156, img:'https://images.unsplash.com/photo-1770763233593-74dfd0da7bf0?w=400&q=80', badge:'-19%',        inStock:true,  categoria:'Herramientas' },
  { id:5,  name:'Martillo Demoledor Eléctrico',        brand:'DeWalt',         price:399.99, oldPrice:null,   rating:5, reviews:92,  img:'https://images.unsplash.com/photo-1731694406562-1cfb3dd25624?w=400&q=80', badge:null,          inStock:false, categoria:'Construcción' },
  { id:6,  name:'Nivel Láser Autonivelante',           brand:'Bosch',          price:179.99, oldPrice:229.99, rating:5, reviews:203, img:'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&q=80', badge:'Popular',     inStock:true,  categoria:'Medición' },
  { id:7,  name:'Compresor de Aire 6 Galones',         brand:'Black & Decker', price:199.99, oldPrice:null,   rating:4, reviews:145, img:'https://images.unsplash.com/photo-1590736969596-f27b3f29c7d2?w=400&q=80', badge:null,          inStock:true,  categoria:'Herramientas' },
  { id:8,  name:'Pistola de Clavos Neumática',         brand:'Stanley',        price:149.99, oldPrice:189.99, rating:4, reviews:98,  img:'https://images.unsplash.com/photo-1599377077583-bf8f3d9eb0f1?w=400&q=80', badge:'-21%',        inStock:true,  categoria:'Construcción' },
  { id:9,  name:'Cable Eléctrico 12 AWG x 100m',      brand:'Irwin',          price:89.99,  oldPrice:110.00, rating:4, reviews:67,  img:'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400&q=80', badge:'-18%',        inStock:true,  categoria:'Eléctrico' },
  { id:10, name:'Pintura Látex Exterior 5 Galones',   brand:'Black & Decker', price:65.00,  oldPrice:null,   rating:4, reviews:112, img:'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&q=80', badge:null,          inStock:true,  categoria:'Pintura' },
  { id:11, name:'Tubería PVC 4" x 6m',                brand:'Irwin',          price:28.50,  oldPrice:null,   rating:5, reviews:89,  img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', badge:null,          inStock:true,  categoria:'Fontanería' },
  { id:12, name:'Cemento Portland 42.5 kg',           brand:'Stanley',        price:12.99,  oldPrice:null,   rating:5, reviews:310, img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80', badge:'Más vendido', inStock:true,  categoria:'Construcción' },
]

export const CATEGORIES = [
  { name: 'Construcción', icon: '🔨', img: 'https://images.unsplash.com/photo-1590736969596-f27b3f29c7d2?w=400&q=80' },
  { name: 'Herramientas', icon: '🔧', img: 'https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=400&q=80' },
  { name: 'Eléctrico',    icon: '⚡', img: 'https://images.unsplash.com/photo-1599377077583-bf8f3d9eb0f1?w=400&q=80' },
  { name: 'Fontanería',   icon: '💧', img: 'https://images.unsplash.com/photo-1503788943072-cd614c3056cf?w=400&q=80' },
  { name: 'Pintura',      icon: '🎨', img: 'https://images.unsplash.com/photo-1519520104014-df63821cb6f9?w=400&q=80' },
  { name: 'Medición',     icon: '📏', img: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&q=80' },
]

export const BRANDS = [
  { name: 'DeWalt',         logo: '🟡', desc: 'Herramientas eléctricas de alto rendimiento', products: 24 },
  { name: 'Makita',         logo: '🔵', desc: 'Innovación y calidad desde 1915',             products: 18 },
  { name: 'Bosch',          logo: '🔴', desc: 'Tecnología alemana para profesionales',        products: 31 },
  { name: 'Stanley',        logo: '🟠', desc: 'Herramientas manuales de confianza',           products: 15 },
  { name: 'Black & Decker', logo: '⚫', desc: 'Soluciones para el hogar y profesionales',     products: 20 },
  { name: 'Irwin',          logo: '🟢', desc: 'Herramientas de corte y sujeción',             products: 12 },
]