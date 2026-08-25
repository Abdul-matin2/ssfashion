"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  authorRole: string;
  authorImage: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: string;
  featured: boolean;
}

interface BlogData {
  hero: {
    title: string;
    subtitle: string;
  };
  posts: BlogPost[];
  categories: string[];
  newsletter: {
    title: string;
    description: string;
  };
}

const defaultBlog: BlogData = {
  hero: {
    title: "The S&S Fashion Blog",
    subtitle: "Style guides, brand stories, and everything footwear",
  },
  categories: ["All", "Style Guides", "Brand Stories", "Care Tips", "Trends", "Behind the Scenes"],
  newsletter: {
    title: "Stay Updated",
    description: "Get the latest style tips, new arrivals, and exclusive offers delivered to your inbox.",
  },
  posts: [
    {
      id: "1",
      title: "How to Style White Sneakers for Every Occasion",
      slug: "style-white-sneakers-every-occasion",
      excerpt: "From office meetings to weekend brunches, white sneakers are the ultimate versatile footwear. Here are 7 ways to style them.",
      content: `
        <p>White sneakers are the ultimate wardrobe chameleon. They bridge the gap between casual and polished, making them suitable for almost any occasion. Whether you're heading to a creative office meeting, a weekend brunch, or a casual date night, the right pair of white sneakers can tie your entire look together.</p>

        <h2>1. The Classic Office Look</h2>
        <p>Pair crisp white leather sneakers with tailored trousers, a tucked-in button-down shirt, and a structured blazer. The sneakers add a modern touch to traditional office wear while keeping you comfortable during long commutes.</p>

        <h2>2. Weekend Brunch Casual</h2>
        <p>Team your white sneakers with high-waisted jeans, a relaxed knit sweater, and a crossbody bag. This effortless combination works perfectly for lazy Saturday mornings.</p>

        <h2>3. Date Night Elevated</h2>
        <p>Style minimal white sneakers with a midi dress and leather jacket. The contrast between feminine and edgy elements creates a balanced, intentional look.</p>

        <h2>4. Athleisure Done Right</h2>
        <p>Match your sneakers with matching jogger set in a neutral tone. Add a long coat for structure and you've mastered the elevated athleisure trend.</p>

        <h2>5. Summer Shorts & Linen</h2>
        <p>White sneakers + tailored shorts + linen shirt = the ultimate warm-weather uniform. Roll the sleeves, leave a few buttons undone, and you're ready for anything.</p>

        <h2>6. Monochrome Minimalist</h2>
        <p>All-white everything. White sneakers, white pants, white tee. It's bold, clean, and unexpectedly sophisticated.</p>

        <h2>7. Print Mixing Pro</h2>
        <p>Let your white sneakers ground a busy outfit. They work as a visual palate cleanser when you're mixing florals with stripes or checks with polka dots.</p>

        <h2>Pro Tip: Keep Them Clean</h2>
        <p>The key to pulling off white sneakers for any occasion? Maintenance. Invest in a good sneaker cleaner, store them with shoe trees, and spot-clean immediately after wear. A pristine pair elevates any outfit; a dirty one undermines it.</p>
      `,
      coverImage: "/images/blog/white-sneakers-guide.jpg",
      author: "Kofi Mensah",
      authorRole: "Style Editor",
      authorImage: "/images/authors/kofi.jpg",
      category: "Style Guides",
      tags: ["sneakers", "styling", "wardrobe essentials"],
      publishedAt: "2026-08-15",
      readTime: "5 min read",
      featured: true,
    },
    {
      id: "2",
      title: "The History of Air Jordan: From Court to Culture",
      slug: "history-air-jordan-court-culture",
      excerpt: "How Michael Jordan's signature shoe became a global phenomenon that transcended basketball and defined sneaker culture.",
      content: `
        <p>When Nike signed a rookie named Michael Jordan in 1984, nobody predicted the cultural earthquake that would follow. The Air Jordan 1 wasn't just a basketball shoe — it was the beginning of a movement that would blur the lines between sport, fashion, and identity.</p>

        <h2>The Banned Shoe That Started It All</h2>
        <p>The NBA famously "banned" the original Air Jordan 1 for not meeting uniform standards (it didn't have enough white). Nike paid the fines — $5,000 per game — and turned the controversy into the most brilliant marketing campaign in sports history. "The NBA can't stop you from wearing them," the ads declared.</p>

        <h2>Design Evolution</h2>
        <p>Each Jordan model told a chapter of MJ's career. The III introduced the Jumpman logo and visible Air. The XI brought patent leather to basketball. The XIII featured a holographic "cat's eye." Tinker Hatfield's designs weren't just performance tools — they were wearable art.</p>

        <h2>Beyond Basketball</h2>
        <p>By the late '90s, Jordans had escaped the hardwood. Hip-hop embraced them. Spike Marsden's Mars Blackmon commercials made them cultural shorthand for excellence. Kids who never watched a Bulls game wanted to "Be Like Mike."</p>

        <h2>The Resale Revolution</h2>
        <p>Limited releases created scarcity. Scarcity created hype. Hype created a billion-dollar resale market. Today, a pair of original 1985 Jordan 1s can fetch six figures at auction.</p>

        <h2>Legacy</h2>
        <p>Forty years later, the Jordan Brand generates billions annually. But more than revenue, it proved that an athlete's signature shoe could become a cultural touchstone — a canvas for self-expression that transcends its original purpose.</p>
      `,
      coverImage: "/images/blog/air-jordan-history.jpg",
      author: "Ama Darko",
      authorRole: "Senior Writer",
      authorImage: "/images/authors/ama.jpg",
      category: "Brand Stories",
      tags: ["jordan", "history", "sneaker culture", "nike"],
      publishedAt: "2026-08-10",
      readTime: "8 min read",
      featured: true,
    },
    {
      id: "3",
      title: "Shoe Care 101: Extend the Life of Your Favorite Pairs",
      slug: "shoe-care-extend-life-favorite-pairs",
      excerpt: "Proper maintenance can double the lifespan of your shoes. Learn the essential cleaning, storage, and protection techniques.",
      content: `
        <p>Quality footwear is an investment. With proper care, a good pair of shoes can last years — even decades. Here's your comprehensive guide to shoe maintenance.</p>

        <h2>Daily Habits</h2>
        <ul>
          <li><strong>Rotate your shoes:</strong> Never wear the same pair two days in a row. Shoes need 24+ hours to fully dry and recover their shape.</li>
          <li><strong>Use shoe trees:</strong> Cedar shoe trees absorb moisture and maintain the shoe's silhouette. Essential for leather.</li>
          <li><strong>Brush after each wear:</strong> A quick horsehair brush removes surface dirt before it settles into pores.</li>
        </ul>

        <h2>Deep Cleaning by Material</h2>
        <h3>Leather</h3>
        <ol>
          <li>Remove laces and brush off loose dirt</li>
          <li>Apply leather cleaner with a soft cloth in circular motions</li>
          <li>Wipe clean with damp cloth</li>
          <li>Condition with leather cream/conditioner</li>
          <li>Buff with horsehair brush</li>
        </ol>

        <h3>Suede & Nubuck</h3>
        <ol>
          <li>Brush with suede brush to raise nap</li>
          <li>Use suede eraser for stains</li>
          <li>Apply suede protector spray</li>
          <li>Brush again once dry</li>
        </ol>

        <h3>Canvas & Knit</h3>
        <ol>
          <li>Remove laces, machine wash in mesh bag (cold, gentle)</li>
          <li>Air dry with paper towels inside to hold shape</li>
          <li>Never use dryer</li>
        </ol>

        <h2>Storage Solutions</h2>
        <p>Store in cool, dry place away from direct sunlight. Use original boxes or clear containers. Stuff toes with acid-free tissue for long-term storage.</p>

        <h2>When to See a Cobbler</h2>
        <p>Resoling, heel replacement, stitching repair, and stretching are worth the investment for quality shoes. A good cobbler can add years to your favorite pairs.</p>
      `,
      coverImage: "/images/blog/shoe-care-guide.jpg",
      author: "Yaw Osei",
      authorRole: "Product Specialist",
      authorImage: "/images/authors/yaw.jpg",
      category: "Care Tips",
      tags: ["maintenance", "cleaning", "storage", "protection"],
      publishedAt: "2026-08-05",
      readTime: "6 min read",
      featured: false,
    },
    {
      id: "4",
      title: "Fall 2026 Footwear Trends: What's Coming to S&S Fashion",
      slug: "fall-2026-footwear-trends",
      excerpt: "Get a sneak peek at the colors, silhouettes, and materials dominating the upcoming season. Plus, our buying recommendations.",
      content: `
        <p>As the seasons shift, so does the footwear landscape. Fall 2026 brings a compelling mix of retro revival, technical innovation, and elevated basics. Here's what you'll be seeing — and buying — at S&S Fashion.</p>

        <h2>Color Palette: Earth Meets Electric</h2>
        <p>Rich browns, deep olives, and warm burgundies dominate, punctuated by unexpected pops of cobalt blue and burnt orange. The "gorp-core" influence brings technical fabrics in muted tones.</p>

        <h2>Silhouettes to Watch</h2>
        <ul>
          <li><strong>Retro Runners:</strong> 2000s trail-inspired shapes with modern cushioning (think New Balance 1906R, ASICS Gel-Kayano 14)</li>
          <li><strong>Elevated Loafers:</strong> Penny loafers with chunky lug soles — office-appropriate with weekend attitude</li>
          <li><strong>Tactical Boots:</strong> Side-zip, Gore-Tex lined, ready for anything</li>
          <li><strong>Ballet Flats 2.0:</strong> Mesh uppers, memory foam insoles, the comfort of a sneaker in a dressy silhouette</li>
        </ul>

        <h2>Materials Moment</h2>
        <p>Recycled mesh, bio-based leathers, and water-resistant treatments are standard. Look for "circular design" callouts — shoes built for disassembly and recycling.</p>

        <h2>S&S Fashion Picks</h2>
        <p>Our buyers have curated a Fall lineup hitting all these notes. Early access for newsletter subscribers September 1st.</p>
      `,
      coverImage: "/images/blog/fall-2026-trends.jpg",
      author: "Kofi Mensah",
      authorRole: "Style Editor",
      authorImage: "/images/authors/kofi.jpg",
      category: "Trends",
      tags: ["fall 2026", "trends", "new arrivals", "seasonal"],
      publishedAt: "2026-08-01",
      readTime: "7 min read",
      featured: true,
    },
    {
      id: "5",
      title: "Meet the Artisans: Kumasi's Leather Sneaker Workshop",
      slug: "meet-artisans-kumasi-leather-sneakers",
      excerpt: "Behind every pair is a story. We visit the workshop where traditional Ghanaian craftsmanship meets modern sneaker design.",
      content: `
        <p>In the heart of Kumasi, tucked behind a bustling market, a small workshop is redefining what "Made in Ghana" means for footwear. Master craftsman Kwame Asante has been hand-stitching leather for three decades. Now, his atelier produces limited-run sneakers that blend traditional techniques with contemporary design.</p>

        <h2>The Process</h2>
        <p>Each pair takes 14 hours. Vegetable-tanned leather from local tanneries. Hand-cut patterns. Goodyear welting adapted for sneaker soles. No assembly lines — just Kwame, his two apprentices, and tools passed down through generations.</p>

        <h2>Why It Matters</h2>
        <p>"Fast fashion forgets the hands that make it," Kwame says. "When you buy handmade, you carry someone's skill, patience, and pride. That energy stays in the shoe."</p>

        <h2>The Collection</h2>
        <p>S&S Fashion's "Kumasi Heritage" capsule drops next month. 50 pairs per colorway. Each numbered. A portion supports the workshop's apprenticeship program.</p>
      `,
      coverImage: "/images/blog/kumasi-artisans.jpg",
      author: "Ama Darko",
      authorRole: "Senior Writer",
      authorImage: "/images/authors/ama.jpg",
      category: "Behind the Scenes",
      tags: ["artisans", "ghana", "craftsmanship", "made in ghana", "sustainability"],
      publishedAt: "2026-07-28",
      readTime: "6 min read",
      featured: false,
    },
    {
      id: "6",
      title: "Running Shoe Rotation: Why Multiple Pairs Prevent Injury",
      slug: "running-shoe-rotation-multiple-pairs",
      excerpt: "Rotating your running shoes isn't just for pros. Here's why it prevents injury and makes your shoes last longer.",
      content: `
        <p>Most runners own one pair of shoes. Research suggests they should own at least two — ideally three. Here's why rotation matters.</p>

        <h2>The Science</h2>
        <p>Midsole foam compresses with each footstrike. It needs 24-48 hours to fully rebound. Running on compressed foam changes your biomechanics, increasing injury risk by up to 39% (per a 2023 Scandinavian Journal of Medicine & Science in Sports study).</p>

        <h2>How to Rotate</h2>
        <ul>
          <li><strong>Daily trainer:</strong> Your go-to for easy miles (max cushion, durable)</li>
          <li><strong>Tempo/race shoe:</strong> Lighter, more responsive for faster efforts</li>
          <li><strong>Trail/weather shoe:</strong> Grip and protection for adverse conditions</li>
        </ul>

        <h2>The Economic Argument</h2>
        <p>Three pairs rotated last longer than three pairs worn sequentially. Foam recovery = extended lifespan. You spend the same, get more miles, reduce injury risk.</p>

        <h2>S&S Recommendations</h2>
        <p>Visit any S&S store for a free gait analysis. Our specialists will build your ideal rotation based on your mileage, pace, and foot type.</p>
      `,
      coverImage: "/images/blog/running-shoe-rotation.jpg",
      author: "Yaw Osei",
      authorRole: "Product Specialist",
      authorImage: "/images/authors/yaw.jpg",
      category: "Care Tips",
      tags: ["running", "injury prevention", "rotation", "training"],
      publishedAt: "2026-07-22",
      readTime: "5 min read",
      featured: false,
    },
    {
      id: "7",
      title: "New Balance 550: The Retro Comeback Nobody Saw Coming",
      slug: "new-balance-550-retro-comeback",
      excerpt: "From forgotten basketball shoe to streetwear staple. How the 550 became the coolest sneaker nobody saw coming.",
      content: `
        <p>Released in 1989. Forgotten by 1995. Rediscovered by 2020. The New Balance 550's journey from clearance rack to grail status is a masterclass in how culture moves in cycles.</p>

        <h2>Original Purpose</h2>
        <p>Designed as a high-performance basketball shoe. Worn by NBA players like James Worthy. Then basketball tech moved on — Air, Zoom, carbon plates — and the 550 became a footnote.</p>

        <h2>The Resurrection</h2>
        <p>Japanese retailer Beams collaborated with New Balance in 2020. Then Aimé Leon Dore. Then everyone. The 550's clean lines, premium leather, and unmistakably '80s silhouette hit perfectly with the vintage revival trend.</p>

        <h2>Why It Works</h2>
        <p>It's wearable history that doesn't scream "vintage." The 550 pairs with tailored trousers as easily as baggy jeans. It's the rare sneaker that feels equally at home in a creative office and a skate park.</p>

        <h2>Current Drops</h2>
        <p>S&S Fashion stocks the "Green/Grey" and "White/Navy" colorways. More arriving monthly. Sign up for restock alerts.</p>
      `,
      coverImage: "/images/blog/nb-550-story.jpg",
      author: "Kofi Mensah",
      authorRole: "Style Editor",
      authorImage: "/images/authors/kofi.jpg",
      category: "Brand Stories",
      tags: ["new balance", "550", "retro", "streetwear", "collab"],
      publishedAt: "2026-07-15",
      readTime: "6 min read",
      featured: false,
    },
    {
      id: "8",
      title: "Packing Light: 3 Pairs for Any Trip",
      slug: "packing-light-3-pairs-any-trip",
      excerpt: "Travel smarter with our minimalist shoe packing guide. Versatile footwear that covers business, casual, and active days.",
      content: `
        <p>Shoes are the heaviest, bulkiest items in your luggage. The solution isn't packing more — it's packing smarter. Three pairs. Every scenario covered.</p>

        <h2>The Formula</h2>
        <ol>
          <li><strong>One polished leather pair:</strong> Loafers, derbies, or minimal Chelsea boots. Handles dinners, meetings, nice bars.</li>
          <li><strong>One premium white sneaker:</strong> Leather, clean silhouette. Does museums, walking tours, casual days, even smart-casual evenings.</li>
          <li><strong>One technical pair:</strong> Lightweight runner or hiking shoe. Covers workouts, hikes, rainy days, longest walking days.</li>
        </ol>

        <h2>Wear the Bulkiest</h2>
        <p>Wear your technical pair or boots on travel days. Pack the other two in shoe bags (soles facing each other) with socks stuffed inside.</p>

        <h2>S&S Travel Kit</h2>
        <p>Our new Travel Shoe Kit includes: 2 dust bags, cedar shoe trees (collapsible), mini cleaner, and protector spray. Fits in any carry-on.</p>
      `,
      coverImage: "/images/blog/travel-shoe-guide.jpg",
      author: "Ama Darko",
      authorRole: "Senior Writer",
      authorImage: "/images/authors/ama.jpg",
      category: "Style Guides",
      tags: ["travel", "packing", "minimalist", "versatile"],
      publishedAt: "2026-07-10",
      readTime: "4 min read",
      featured: false,
    },
  ],
};

interface BlogPostPageProps {
  params: { slug: string };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    const blogData = defaultBlog;
    const foundPost = blogData.posts.find((p) => p.slug === slug);
    if (foundPost) {
      setPost(foundPost);
    } else {
      setNotFoundFlag(true);
    }
    setIsLoading(false);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 mx-auto text-brand-gold" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="mt-4 text-neutral-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (notFoundFlag || !post) {
    notFound();
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <article className="min-h-screen bg-white">
      {/* Hero / Cover Image */}
      <header className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
            <svg className="h-16 w-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="mx-auto max-w-4xl">
            <span className="inline-block px-3 py-1 text-sm font-medium text-brand-white bg-brand-gold/90 rounded-full mb-4">{post.category}</span>
            <h1 className="text-3xl md:text-5xl font-bold text-brand-white leading-tight mb-4">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-brand-white/90">
              <div className="flex items-center gap-2">
                {post.authorImage ? (
                  <img src={post.authorImage} alt={post.author} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-brand-gold/30 flex items-center justify-center">
                    <span className="text-sm font-medium text-brand-white">{post.author.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{post.author}</p>
                  <p className="text-sm opacity-80">{post.authorRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="prose prose-brand max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-neutral-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-neutral-600">Tags:</span>
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} className="px-3 py-1 text-sm bg-neutral-100 text-neutral-700 rounded-full hover:bg-brand-gold/20 hover:text-brand-black transition-colors">
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio */}
        <div className="mt-12 pt-8 border-t border-neutral-200 flex gap-4">
          {post.authorImage ? (
            <img src={post.authorImage} alt={post.author} className="h-16 w-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-brand-gold">{post.author.charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-brand-black">{post.author}</h3>
            <p className="text-sm text-neutral-600">{post.authorRole}</p>
          </div>
        </div>

        {/* Newsletter CTA */}
        <section className="mt-16 p-8 bg-brand-black rounded-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-white mb-3">{defaultBlog.newsletter.title}</h2>
          <p className="text-brand-white/80 mb-6 max-w-md mx-auto">{defaultBlog.newsletter.description}</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-brand-white placeholder:text-brand-white/50 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent" required />
            <button type="submit" className="px-6 py-3 bg-brand-gold text-brand-black font-medium rounded-xl hover:bg-brand-gold/90 transition-colors whitespace-nowrap">{defaultBlog.newsletter.title === "Stay Updated" ? "Subscribe" : "Join"}</button>
          </form>
        </section>

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-accent-hover font-medium transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Blog
          </Link>
        </div>
      </main>
    </article>
  );
}