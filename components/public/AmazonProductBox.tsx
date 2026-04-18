import Image from "next/image";
import { ExternalLink, Check, X, Star } from "lucide-react";

interface Product {
  name: string;
  amazonUrl: string;
  imageUrl: string;
  price: string;
  badge: string;
  pros: string[];
  cons: string[];
}

export default function AmazonProductBox({ products }: { products: Product[] }) {
  if (!products?.length) return null;

  return (
    <div className="my-10 not-prose">
      <div className="flex items-center gap-3 mb-5">
        <Star size={18} className="text-amazon fill-amazon" />
        <h3 className="font-heading text-xl font-bold text-primary dark:text-white">
          Our Top Picks
        </h3>
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, i) => (
          <div key={i} className="card p-5 flex flex-col relative group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            {/* Badge */}
            {product.badge && (
              <span className="absolute -top-2.5 left-5 bg-amazon text-white text-xs font-bold px-3 py-1 rounded-full shadow-md shadow-amazon/30">
                {product.badge}
              </span>
            )}

            {/* Image */}
            {product.imageUrl && (
              <div className="relative h-44 mb-4 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <h4 className="font-semibold text-sm text-primary dark:text-white mb-1 leading-snug">
              {product.name}
            </h4>

            {product.price && (
              <p className="text-amazon font-black text-2xl mb-3">{product.price}</p>
            )}

            {/* Pros */}
            {product.pros?.filter(Boolean).length > 0 && (
              <div className="mb-2 space-y-1.5">
                {product.pros.filter(Boolean).map((pro, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Check size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {pro}
                  </div>
                ))}
              </div>
            )}

            {/* Cons */}
            {product.cons?.filter(Boolean).length > 0 && (
              <div className="mb-4 space-y-1.5">
                {product.cons.filter(Boolean).map((con, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs text-slate-400">
                    <X size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                    {con}
                  </div>
                ))}
              </div>
            )}

            <a
              href={product.amazonUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="amazon-btn mt-auto text-sm"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705c-.209.189-.512.201-.748.074-1.052-.872-1.238-1.276-1.814-2.106-1.734 1.767-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.925 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.095v-.41c0-.753.06-1.641-.384-2.294-.385-.581-1.124-.82-1.775-.82-1.205 0-2.277.618-2.54 1.897-.054.285-.261.567-.549.582l-3.061-.333c-.259-.056-.547-.266-.472-.66.704-3.716 4.06-4.838 7.066-4.838 1.537 0 3.547.41 4.758 1.574 1.538 1.437 1.392 3.352 1.392 5.438v4.923c0 1.481.616 2.13 1.192 2.929.204.287.247.63-.01.839l-2.387 2.092z"/>
              </svg>
              View on Amazon <ExternalLink size={13} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
