import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiUpload,
  FiX,
  FiCheck,
  FiMinus,
  FiPlus,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/helpers";
import ImageCropper from "../components/ImageCropper";

export default function ProductPage() {
  const fileInputRefs = useRef([]);

  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const fileInputRef = useRef();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  // const [customImage,   setCustomImage]   = useState(null)   // { file, preview, uploaded }
  const [customImages, setCustomImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const [activeCropIndex, setActiveCropIndex] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then(({ data }) => {
        setProduct(data.product);
        if (data.product.variants?.length)
          setSelectedVariant(data.product.variants[0]);
      })
      .catch(() => navigate("/404"))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!product?.requiresCustomImage) return;

    setCustomImages((prev) => {
      const arr = [...prev];

      if (qty > arr.length) {
        return [...arr, ...Array(qty - arr.length).fill(null)];
      } else {
        return arr.slice(0, qty);
      }
    });
  }, [qty, product]);

  // const handleFileChange = async (e) => {
  //   const file = e.target.files[0]
  //   if (!file) return

  //   // Preview
  //   const preview = URL.createObjectURL(file)
  //   setCustomImage({ file, preview, uploaded: null })

  //   // Upload to backend → Cloudinary (original quality)
  //   setUploading(true)
  //   try {
  //     const formData = new FormData()
  //     formData.append('image', file)
  //     const { data } = await api.post('/upload/customer-image', formData, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     })
  //     setCustomImage((prev) => ({ ...prev, uploaded: data.image }))
  //     toast.success('Image uploaded successfully!')
  //   } catch (err) {
  //     toast.error('Upload failed. Please try again.')
  //     setCustomImage(null)
  //   } finally {
  //     setUploading(false)
  //   }
  // }

  //   const handleFileChange = (e, index) => {
  //   const file = e.target.files[0]
  //   if (!file) return

  //   const preview = URL.createObjectURL(file)

  //   // setCustomImages((prev) => {
  //   //   const updated = [...prev]
  //   //   updated[index] = { file, preview }
  //   //   return updated
  //   // })

  //   setCustomImages(prev => {
  //   const updated = [...prev]
  //   updated[index] = undefined   //  better than null
  //   return updated
  // })
  // }

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    setCustomImages((prev) => {
      const updated = [...prev];
      // Ensure array length
      while (updated.length < qty) {
        updated.push(undefined);
      }
      updated[index] = { file, preview };
      return updated;
    });

    setActiveCropIndex(index); // open cropper
  };

  // const handleAddToCart = () => {
  //   if (product.requiresCustomImage && !customImage?.uploaded) {
  //     toast.error('Please upload your photo first!')
  //     return
  //   }
  //   if (product.variants?.length && !selectedVariant) {
  //     toast.error('Please select a size')
  //     return
  //   }

  //   setAddingToCart(true)
  //   const price = selectedVariant?.price || product.basePrice
  //   addItem({
  //     productId:   product._id,
  //     name:        product.name,
  //     slug:        product.slug,
  //     image:       product.images[0]?.url || '',
  //     variant:     selectedVariant?.size || '',
  //     price,
  //     quantity:    qty,
  //     customImage: customImage?.uploaded || null,
  //   })
  //   toast.success('Added to cart!')
  //   setTimeout(() => setAddingToCart(false), 800)
  // }


// Convert base64 → File
  const base64ToFile = async (base64) => {
  const res = await fetch(base64);
  const blob = await res.blob();
  return new File([blob], "cropped.jpg", { type: "image/jpeg" });
};

  const handleAddToCart = async () => {
    // if (product.requiresCustomImage) {

    //   if (customImages.length !== qty || customImages.some(img => !img?.file)) {
    //     toast.error(`Please upload ${qty} photos`)
    //     return
    //   }

    // }

    if (product.requiresCustomImage) {
      if (
        customImages.length !== qty ||
        customImages.filter(Boolean).length !== qty
      ) {
        toast.error(`Please upload ${qty} photos`);
        return;
      }
    }

    if (product.variants?.length && !selectedVariant) {
      toast.error("Please select a size");
      return;
    }

    setAddingToCart(true);

    let uploadedImages = [];

    if (product.requiresCustomImage) {
      setUploading(true);
      try {
        toast.loading("images is Uplading.....");
        for (let img of customImages) {
          const formData = new FormData();

          //this is direct file
          // formData.append("image", img.file);

          //now use crop file
          // formData.append("image", img.cropped);
          // console.log("croped image:" , img.cropped)img.cropped = base64 string (data:image/jpeg;base64,...)



            const file = await base64ToFile(img.cropped); //  convert
           console.log("file : " , file);
            formData.append("image", file); //  real file



          const { data } = await api.post("/upload/customer-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          uploadedImages.push(data.image);
        }
        toast.dismiss("images uploaded successfully!");
      } catch (err) {
        toast.error("Upload failed");
        setUploading(false);
        setAddingToCart(false);
        return;
      }
      setUploading(false);
    }

    const basePrice = selectedVariant?.price || product.basePrice;
    // const finalPrice = basePrice * qty; // ✅ FIXED PRICE
    const finalPrice = basePrice; // ✅ FIXED PRICE

    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url || "",
      variant: selectedVariant?.size || "",
      price: finalPrice,
      quantity: qty,
      customImages: uploadedImages, // ✅ multiple images
    });

    toast.success("Added to cart!");
    setTimeout(() => setAddingToCart(false), 800);
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="space-y-4 pt-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="space-y-2 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );

  if (!product) return null;

  // const displayPrice = selectedVariant?.price || product.basePrice
  const displayMrp = selectedVariant?.mrp || product.variants?.[0]?.mrp;
  const basePrice = selectedVariant?.price || product.basePrice;
  const displayPrice = basePrice; //
  const totalPrice = basePrice * qty; // 🔥 qty based pricing

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* ── Images ─────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 shadow-sm">
            {product.images?.[selectedImage] ? (
              <img
                src={product.images[selectedImage].url}
                alt={product.images[selectedImage].alt || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                🧲
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-brand-600" : "border-transparent hover:border-brand-300"}`}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details ────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
              {product.category.replace("-", " ")}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-dark mt-3 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-2xl font-bold text-dark">
                {formatPrice(displayPrice)}
              </span>
              {displayMrp && displayMrp > displayPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(displayMrp)}
                  </span>
                  <span className="badge-sale">
                    {Math.round(
                      ((displayMrp - displayPrice) / displayMrp) * 100,
                    )}
                    % OFF
                  </span>
                </>
              )}
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Variants (size selector) */}
          {product.variants?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-dark mb-2">
                Size:{" "}
                <span className="text-brand-600">{selectedVariant?.size}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.size}
                    onClick={() => setSelectedVariant(v)}
                    disabled={!v.inStock}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                      ${
                        selectedVariant?.size === v.size
                          ? "border-brand-600 bg-brand-50 text-brand-700"
                          : "border-gray-200 text-gray-600 hover:border-brand-300"
                      } ${!v.inStock ? "opacity-40 cursor-not-allowed line-through" : ""}`}
                  >
                    {v.size} — {formatPrice(v.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom image upload */}
          {product.requiresCustomImage && (
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-dark mb-1 flex items-center gap-1.5">
                <FiUpload size={15} className="text-brand-600" />
                Upload Your Photo <span className="text-red-500">*</span>
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Upload a high-resolution image for best print quality. JPG, PNG,
                HEIC accepted (max 50MB).
              </p>

              {customImages.map((img, index) => (
                <div key={index} className="mb-3">
                  {img?.cropped ? (
                    <div className="relative">
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={img.cropped || img.preview}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <button
                        onClick={() => {
                          setCustomImages((prev) => {
                            const updated = [...prev];
                            updated[index] = null;
                            return updated;
                          });
                        }}
                        className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <FiX size={12} /> Remove photo {index + 1}
                      </button>
                    </div>
                  ) : (
                    <button
                      // onClick={() => fileInputRef.current?.click()}
                      onClick={() => fileInputRefs.current[index]?.click()}
                      className="w-full border-2 border-dashed border-brand-300 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-brand-500 hover:bg-brand-100/50 transition-colors text-brand-600"
                    >
                      <FiUpload size={24} />
                      <span className="text-sm font-medium">
                        Upload Photo {index + 1}
                      </span>
                    </button>
                  )}

                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, index)}
                    className="hidden"
                    // ref={fileInputRef}
                    ref={(el) => (fileInputRefs.current[index] = el)}
                  />
                </div>
              ))}

              {activeCropIndex !== null && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
                  <div className="bg-white p-4 rounded-xl w-[90%] max-w-md">
                    <ImageCropper
                      image={customImages[activeCropIndex].preview}
                      aspect={1}
                      onComplete={(croppedImg) => {
                        setCustomImages((prev) => {
                          const updated = [...prev];
                          updated[activeCropIndex] = {
                            ...updated[activeCropIndex],
                            cropped: croppedImg,
                          };
                          return updated;
                        });

                        setActiveCropIndex(null);
                      }}
                    />
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-dark">Quantity:</span>
            <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="text-dark hover:text-brand-600"
              >
                <FiMinus size={16} />
              </button>
              <span className="w-8 text-center font-medium">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="text-dark hover:text-brand-600"
              >
                <FiPlus size={16} />
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            {/* <button
              onClick={handleAddToCart}
              disabled={addingToCart || uploading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-base py-4"
            >
              <FiShoppingCart size={18} />
              {addingToCart
                ? "Added!"
                : uploading
                  ? "Uploading..."
                  : `Add to Cart ${totalPrice}`}
            </button> */}

            <button
              onClick={handleAddToCart}
              disabled={addingToCart || uploading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-base py-4 disabled:opacity-50"
              aria-live="polite"
            >
              <FiShoppingCart size={18} />
              {addingToCart ? (
                "Added!"
              ) : uploading ? (
                "Uploading..."
              ) : (
                <>
                  Add to Cart <span className="font-bold">₹{totalPrice}</span>
                </>
              )}
            </button>
          </div>

          {/* Shipping note */}
          <p className="text-xs text-gray-400 text-center">
            🚚 Free shipping on orders above ₹699 · Delivered in 5–7 business
            days
          </p>
        </div>
      </div>
    </div>
  );
}
