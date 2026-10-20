import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Feather, HeartHandshake } from 'lucide-react';
import { Product, Category } from '../types/index.js';
import { api } from '../lib/api.js';
import { ProductCard } from '../components/product/ProductCard.js';
import { Button } from '../components/common/Button.js';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setIsLoading(true);
        const [featRes, newRes, catRes] = await Promise.all([
          api.get<{ data: Product[] }>('/products?isFeatured=true&limit=4'),
          api.get<{ data: Product[] }>('/products?isNewArrival=true&limit=4'),
          api.get<{ data: Category[] }>('/categories'),
        ]);

        setFeaturedProducts(featRes.data);
        setNewArrivals(newRes.data);
        setCategories(catRes.data.filter((c) => !c.parentId));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. Hero Section */}
      <section className="relative min-h-[75vh] flex items-center justify-center bg-[#F4EFEA] overflow-hidden">
        {/* Background Image with artistic wash */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=80"
            alt="Handloom silk and cotton textile"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-vastra-terracotta-light text-vastra-terracotta text-xs font-semibold tracking-widest uppercase rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Pure Indian Handloom & Organic Wear
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-vastra-charcoal tracking-tight leading-[1.15] mb-6">
            Woven with Grace, <br />
            <span className="italic font-normal text-vastra-terracotta">Rooted in Tradition</span>
          </h1>

          <p className="text-sm sm:text-base text-vastra-muted max-w-2xl mx-auto mb-10 leading-relaxed font-sans font-normal">
            Immerse yourself in authentic GOTS-certified organic cotton, wild forest Tussar silks,
            and handcrafted temple jewellery created by heritage artisan guilds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/products">
              <Button size="lg" className="w-full sm:w-auto shadow-md">
                Explore The Collection
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/products?isNewArrival=true">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/80">
                New Arrivals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-vastra-terracotta block mb-2">
            Curated Lines
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-vastra-charcoal">
            Shop by Category
          </h2>
          <div className="w-12 h-0.5 bg-vastra-terracotta mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group relative aspect-[4/5] rounded-sm overflow-hidden bg-vastra-surface shadow-xs hover:shadow-elevated transition-all duration-500"
            >
              <img
                src={cat.imageUrl || 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6 text-white text-center sm:text-left">
                <h3 className="font-serif text-xl font-semibold mb-1 group-hover:text-vastra-sand-light transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-white/80 line-clamp-1 mb-3">
                  {cat.description}
                </p>
                <span className="inline-flex items-center text-xs font-medium tracking-wider uppercase text-vastra-sand group-hover:translate-x-1 transition-transform">
                  Browse Pieces →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-vastra-border">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-vastra-terracotta block mb-1">
              Curator’s Choice
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-vastra-charcoal">
              Featured Creations
            </h2>
          </div>
          <Link
            to="/products?isFeatured=true"
            className="text-xs font-semibold uppercase tracking-wider text-vastra-terracotta hover:underline mt-2 sm:mt-0"
          >
            View All Featured ({featuredProducts.length}) →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-vastra-surface animate-pulse rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Brand Philosophy / Sacred Craft */}
      <section className="bg-vastra-surface border-y border-vastra-border/80 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-vastra-terracotta">
                Ethos & Conscience
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-vastra-charcoal leading-tight">
                Clothing Crafted to Breathe with Your Body
              </h2>
              <p className="text-sm text-vastra-muted leading-relaxed">
                Conventional synthetic garments stifle natural prana and trap heat. Tantuvi Atelier designs
                wear using exclusively unbleached, hand-spun GOTS cotton, wild forest Tussar silk,
                and pure European flax linen. Woven patiently on non-electric wooden pit looms, each
                garment softens into second-skin comfort.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-vastra-terracotta-light text-vastra-terracotta flex items-center justify-center shrink-0 mt-0.5">
                    <Feather className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">100% Breathable</h4>
                    <p className="text-xs text-vastra-muted">Keeps the body cool in tropical heat.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-vastra-olive-light text-vastra-olive flex items-center justify-center shrink-0 mt-0.5">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Fair Artisan Wages</h4>
                    <p className="text-xs text-vastra-muted">Directly sustaining traditional weaver families.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-sm overflow-hidden shadow-elevated">
              <img
                src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80"
                alt="Artisan handloom weaving process"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-stone-900/10" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-vastra-border">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-vastra-olive block mb-1">
              Fresh From the Loom
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-vastra-charcoal">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/products?isNewArrival=true"
            className="text-xs font-semibold uppercase tracking-wider text-vastra-terracotta hover:underline mt-2 sm:mt-0"
          >
            Explore All New ({newArrivals.length}) →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-vastra-surface animate-pulse rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Promotional Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-vastra-charcoal text-white rounded-sm p-8 sm:p-14 text-center relative overflow-hidden shadow-elevated">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-vastra-sand">
              Special Celebration Offer
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              Enjoy 10% Off Your First Handloom Ensemble
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Use promotional code <span className="text-vastra-sand font-mono font-bold tracking-wider">VASTRA10</span> at checkout on orders above ₹1,500.
            </p>
            <div className="pt-2">
              <Link to="/products">
                <Button variant="primary" size="md" className="bg-vastra-sand hover:bg-vastra-sand-hover text-stone-900 font-bold">
                  Browse All Collections
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
