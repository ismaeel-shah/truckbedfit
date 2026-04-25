import { AtSign, Globe, User } from "lucide-react";

interface Author {
  name: string;
  bio?: string;
  photo?: string;
  twitter?: string;
  website?: string;
}

export default function AuthorCard({ author }: { author: Author }) {
  return (
    <div className="mt-12 p-6 border border-slate-200 rounded-2xl flex gap-5 items-start">
      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
        {author.photo ? (
          <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent/20">
            <User size={28} className="text-accent" />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">Written by</p>
        <h3 className="font-heading font-bold text-primary text-lg leading-tight">{author.name}</h3>
        {author.bio && (
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{author.bio}</p>
        )}
        {(author.twitter || author.website) && (
          <div className="flex items-center gap-3 mt-3">
            {author.twitter && (
              <a
                href={`https://twitter.com/${author.twitter.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-accent transition-colors"
              >
                <AtSign size={13} /> {author.twitter.replace("@", "")}
              </a>
            )}
            {author.website && (
              <a
                href={author.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-accent transition-colors"
              >
                <Globe size={13} /> Website
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
