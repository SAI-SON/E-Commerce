import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { Product, Category } from '../../types';
import { Button } from '../../components/ui/Button';

interface VariantInput {
  sku: string;
  size: string;
  colour: string;
  colourHex: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
}

interface ImageInput {
  url: string;
  altText: string;
  isPrimary: boolean;
}

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [images, setImages] = useState<ImageInput[]>([
    { url: '', altText: '', isPrimary: true },
  ]);

  const [variants, setVariants] = useState<VariantInput[]>([
    {
      sku: '',
      size: 'M',
      colour: 'Natural Off-White',
      colourHex: '#FAF9F6',
      price: 2490,
      salePrice: null,
      stockQuantity: 15,
    },
  ]);

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<{ data: Category[] }>('/categories');
      return res.data;
    },
  });

  // If edit mode, fetch product details
  const { data: existingProduct, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: ['admin-product', id],
    queryFn: async () => {
      const res = await api.get<{ data: Product }>(`/admin/products/${id}`);
      return res.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setSlug(existingProduct.slug);
      setCategoryId(existingProduct.categoryId || existingProduct.category?.id || '');
      setShortDescription(existingProduct.shortDescription || '');
      setDescription(existingProduct.description || '');
      setMaterial(existingProduct.material || '');
      setCareInstructions(existingProduct.careInstructions || '');
      setIsPublished(existingProduct.isPublished);
      setIsFeatured(existingProduct.isFeatured);
      setIsNewArrival(existingProduct.isNewArrival);
      setTagsInput(existingProduct.tags ? existingProduct.tags.join(', ') : '');

      if (existingProduct.images && existingProduct.images.length > 0) {
        setImages(
          existingProduct.images.map((img) => ({
            url: img.url,
            altText: img.altText || '',
            isPrimary: img.isPrimary,
          }))
        );
      }

      if (existingProduct.variants && existingProduct.variants.length > 0) {
        setVariants(
          existingProduct.variants.map((v) => ({
            sku: v.sku,
            size: v.size,
            colour: v.colour,
            colourHex: v.colourHex || '',
            price: Number(v.price),
            salePrice: v.salePrice ? Number(v.salePrice) : null,
            stockQuantity: v.stockQuantity,
          }))
        );
      }
    }
  }, [existingProduct]);

  // Auto-slug generator when typing name in create mode
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(autoSlug);
    }
  };

  const handleAddImage = () => {
    setImages([...images, { url: '', altText: '', isPrimary: false }]);
  };

  const handleRemoveImage = (index: number) => {
    if (images.length === 1) return;
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    const nextSku = slug ? `${slug.toUpperCase().slice(0, 4)}-${variants.length + 1}` : `SKU-${variants.length + 1}`;
    setVariants([
      ...variants,
      {
        sku: nextSku,
        size: 'L',
        colour: 'Natural',
        colourHex: '#FAF9F6',
        price: variants[0]?.price || 2490,
        salePrice: null,
        stockQuantity: 10,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        name,
        slug,
        categoryId: categoryId || categories?.[0]?.id,
        shortDescription,
        description,
        material,
        careInstructions,
        isPublished,
        isFeatured,
        isNewArrival,
        tags,
        images: images.filter((img) => img.url.trim() !== ''),
        variants: variants.map((v) => ({
          ...v,
          price: Number(v.price),
          salePrice: v.salePrice ? Number(v.salePrice) : null,
          stockQuantity: Number(v.stockQuantity),
        })),
      };

      if (isEdit && id) {
        // Update product metadata
        return await api.patch(`/admin/products/${id}`, {
          name: payload.name,
          shortDescription: payload.shortDescription,
          description: payload.description,
          material: payload.material,
          careInstructions: payload.careInstructions,
          categoryId: payload.categoryId,
          isPublished: payload.isPublished,
          isFeatured: payload.isFeatured,
          isNewArrival: payload.isNewArrival,
          tags: payload.tags,
        });
      } else {
        // Create full product with variants and images
        return await api.post('/admin/products', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products');
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to save product. Please check all fields.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErrorMsg('Product name is required');
    if (!description.trim()) return setErrorMsg('Description is required');
    if (!categoryId && (!categories || categories.length === 0)) {
      return setErrorMsg('Please create or select a valid category');
    }
    submitMutation.mutate();
  };

  if (isEdit && isLoadingProduct) {
    return <div className="p-8 text-stone-500 text-xs">Loading product records...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              {isEdit ? `Edit: ${name}` : 'New Handcrafted Product'}
            </h1>
            <p className="text-xs text-stone-500">
              {isEdit ? 'Update product description, tags, and classification' : 'Register a new clothing or jewellery piece'}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          variant="primary"
          size="sm"
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{submitMutation.isPending ? 'Saving...' : 'Save Product'}</span>
        </Button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details Card */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
            Core Details & Categorization
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Pure Khadi Linen Kurta"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="pure-khadi-linen-kurta"
                className="w-full px-3 py-2 text-xs font-mono border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-white"
              >
                <option value="">Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Search Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="organic, linen, festive, kurta"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Short Summary
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Hand-spun breathable cotton kurta crafted in Varanasi"
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Full Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of craftsmanship, weaving, texture, and inspiration..."
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Material & Weave
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="100% Organic Cotton"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Care Instructions
              </label>
              <input
                type="text"
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="Dry clean only or cold gentle hand wash with mild soap"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>
          </div>

          {/* Visibility Checkboxes */}
          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-stone-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 border-stone-300 focus:ring-amber-600"
              />
              <span className="text-xs font-medium text-stone-800">Published on Storefront</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 border-stone-300 focus:ring-amber-600"
              />
              <span className="text-xs font-medium text-stone-800">Featured Showcase</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 border-stone-300 focus:ring-amber-600"
              />
              <span className="text-xs font-medium text-stone-800">New Arrival Ribbon</span>
            </label>
          </div>
        </div>

        {/* Media URLs Card */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="font-serif text-base font-bold text-stone-900">
              Imagery & Photos ({images.length})
            </h2>
            <Button
              type="button"
              onClick={handleAddImage}
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Image URL</span>
            </Button>
          </div>

          <div className="space-y-3">
            {images.map((img, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={img.url}
                  onChange={(e) => {
                    const next = [...images];
                    next[idx].url = e.target.value;
                    setImages(next);
                  }}
                  className="flex-1 px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
                <input
                  type="text"
                  placeholder="Alt text"
                  value={img.altText}
                  onChange={(e) => {
                    const next = [...images];
                    next[idx].altText = e.target.value;
                    setImages(next);
                  }}
                  className="w-48 px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
                <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer">
                  <input
                    type="radio"
                    name="primaryImage"
                    checked={img.isPrimary}
                    onChange={() => {
                      const next = images.map((im, i) => ({
                        ...im,
                        isPrimary: i === idx,
                      }));
                      setImages(next);
                    }}
                    className="text-amber-600"
                  />
                  <span>Primary</span>
                </label>
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1.5 text-stone-400 hover:text-red-500 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Variants Configuration Card (Disabled in edit mode to preserve transactional inventory audit) */}
        {!isEdit && (
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="font-serif text-base font-bold text-stone-900">
                  Initial Variants & Stock Setup
                </h2>
                <p className="text-[11px] text-stone-500">
                  Subsequent stock adjustments are audited in the Inventory log.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleAddVariant}
                variant="outline"
                size="sm"
                className="gap-1 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </Button>
            </div>

            <div className="space-y-4">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-stone-50/60 rounded-lg border border-stone-200/60 grid grid-cols-2 sm:grid-cols-6 gap-3 items-end"
                >
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => {
                        const next = [...variants];
                        next[idx].sku = e.target.value;
                        setVariants(next);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-stone-200 rounded bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Size
                    </label>
                    <input
                      type="text"
                      value={v.size}
                      onChange={(e) => {
                        const next = [...variants];
                        next[idx].size = e.target.value;
                        setVariants(next);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Colour
                    </label>
                    <input
                      type="text"
                      value={v.colour}
                      onChange={(e) => {
                        const next = [...variants];
                        next[idx].colour = e.target.value;
                        setVariants(next);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Regular Price (₹)
                    </label>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => {
                        const next = [...variants];
                        next[idx].price = Number(e.target.value);
                        setVariants(next);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={v.stockQuantity}
                      onChange={(e) => {
                        const next = [...variants];
                        next[idx].stockQuantity = Number(e.target.value);
                        setVariants(next);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded bg-white"
                    />
                  </div>

                  <div className="flex justify-end pb-1">
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1.5 text-stone-400 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Link to="/admin/products">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitMutation.isPending}
            variant="primary"
            size="sm"
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{submitMutation.isPending ? 'Saving...' : 'Save Product'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
export default ProductFormPage;
