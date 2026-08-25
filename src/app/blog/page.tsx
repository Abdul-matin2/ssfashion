"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
      content: "Full article content would go here...",
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
      content: "Full article content would go here...",
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
      content: "Full article content would go here...",
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
      content: "Full article content would go here...",
      coverImage: "/images/blog/fall-2026-trends.jpg",
      author: "Kofi Mensah",
      authorRole: "Style Editor",
      authorImage: "/images/authors/kofi.jpg",
      category: "Trends",
      tags: ["trends", "fall 2026", "forecast", "new arrivals"],
      publishedAt: "2026-08-01",
      readTime: "7 min read",
      featured: true,
    },
    {
      id: "5",
      title: "Meet the Artisans: Handcrafted Leather Sneakers from Kumasi",
      slug: "meet-artisans-kumasi-leather-sneakers",
      excerpt: "Behind every pair is a story. We visit the workshop where traditional Ghanaian craftsmanship meets modern sneaker design.",
      content: "Full article content would go here...",
      coverImage: "/images/blog/kumasi-artisans.jpg",
      author: "Ama Darko",
      authorRole: "Senior Writer",
      authorImage: "/images/authors/ama.jpg",
      category: "Behind the Scenes",
      tags: ["artisans", "ghana", "craftsmanship", "local production"],
      publishedAt: "2026-07-28",
      readTime: "10 min read",
      featured: false,
    },
    {
      id: "6",
      title: "Running Shoe Rotation: Why You Need Multiple Pairs",
      slug: "running-shoe-rotation-multiple-pairs",
      excerpt: "Rotating your running shoes isn't just for pros. Here's why it prevents injury and makes your shoes last longer.",
      content: "Full article content would go here...",
      coverImage: "/images/blog/running-shoe-rotation.jpg",
      author: "Yaw Osei",
      authorRole: "Product Specialist",
      authorImage: "/images/authors/yaw.jpg",
      category: "Care Tips",
      tags: ["running", "injury prevention", "rotation", "performance"],
      publishedAt: "2026-07-22",
      readTime: "4 min read",
      featured: false,
    },
    {
      id: "7",
      title: "New Balance 550: The Retro Comeback Story",
      slug: "new-balance-550-retro-comeback",
      excerpt: "From forgotten basketball shoe to streetwear staple. How the 550 became the coolest sneaker nobody saw coming.",
      content: "Full article content would go here...",
      coverImage: "/images/blog/nb-550-story.jpg",
      author: "Kofi Mensah",
      authorRole: "Style Editor",
      authorImage: "/images/authors/kofi.jpg",
      category: "Brand Stories",
      tags: ["new balance", "retro", "streetwear", "basketball"],
      publishedAt: "2026-07-18",
      readTime: "6 min read",
      featured: false,
    },
    {
      id: "8",
      title: "Packing Light: The 3 Pairs You Need for Any Trip",
      slug: "packing-light-3-pairs-any-trip",
      excerpt: "Travel smarter with our minimalist shoe packing guide. Versatile footwear that covers business, casual, and active days.",
      content: "Full article content would go here...",
      coverImage: "/images/blog/travel-shoe-guide.jpg",
      author: "Ama Darko",
      authorRole: "Senior Writer",
      authorImage: "/images/authors/ama.jpg",
      category: "Style Guides",
      tags: ["travel", "packing", "versatile", "minimalism"],
      publishedAt: "2026-07-12",
      readTime: "5 min read",
      featured: false,
    },
  ],
};

export default function BlogPage() {
  const [blog, setBlog] = useState<BlogData>(defaultBlog);
  const [activeCategory, setActiveCategory] = useState("All");
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [regularPosts, setRegularPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setBlog(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const featured = blog.posts.filter((p) => p.featured);
    const regular = blog.posts.filter((p) => !p.featured);
    setFeaturedPosts(featured);
    setRegularPosts(regular);
  }, [blog.posts]);

  const filteredPosts = regularPosts.filter(
    (post) => activeCategory === "All" || post.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-black mb-4">
            {blog.hero.title}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {blog.hero.subtitle}
          </p>
        </div>

        {/* Category Filter */}
        <section className="mb-12">
          <div className="flex flex-wrap justify-center gap-2">
            {blog.categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? "bg-brand-black text-brand-white shadow-md"
                    : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-brand-black text-center mb-10">
              Featured Stories
            </h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredPosts.map((post, index) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
                >
                  <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] overflow-hidden">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                        <svg className="h-16 w-16 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-brand-gold text-brand-black text-xs font-medium">
                      {post.category}
                    </span>
                  </Link>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <time className="text-sm text-neutral-500">{post.publishedAt}</time>
                      <span className="text-sm text-neutral-400">•</span>
                      <span className="text-sm text-neutral-500">{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold text-brand-black mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-neutral-600 mb-4 flex-1 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                        {post.authorImage ? (
                          <img src={post.authorImage} alt={post.author} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-brand-black">{post.author}</p>
                        <p className="text-xs text-neutral-500">{post.authorRole}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Regular Posts */}
        <section className="mb-16">
          {featuredPosts.length > 0 && (
            <h2 className="text-2xl font-bold text-brand-black text-center mb-10">
              Latest Articles
            </h2>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <Link href={`/blog/${post.slug}`} className="relative aspect-[4/3] overflow-hidden">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                      <svg className="h-12 w-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-brand-gold text-brand-black text-xs font-medium">
                    {post.category}
                  </span>
                </Link>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <time className="text-xs text-neutral-500">{post.publishedAt}</time>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-neutral-500">{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-brand-black mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center">
                      {post.authorImage ? (
                        <img src={post.authorImage} alt={post.author} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500">{post.author}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-600">No articles found in this category.</p>
            </div>
          )}
        </section>

        {/* Newsletter Signup */}
        <section className="mb-16">
          <div className="bg-brand-black rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-white mb-3">
              {blog.newsletter.title}
            </h2>
            <p className="text-brand-white/80 text-lg mb-8 max-w-xl mx-auto">
              {blog.newsletter.description}
            </p>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-xl bg-brand-white/10 border border-brand-white/20 text-brand-white placeholder-brand-white/50 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-brand-gold text-brand-black rounded-xl font-semibold hover:bg-brand-gold/90 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-brand-gold rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-black mb-4">
            Have a Story Idea?
          </h2>
          <p className="text-brand-black/80 text-lg mb-8 max-w-xl mx-auto">
            We'd love to hear from you! Pitch us a story or suggest a topic you'd like us to cover.
          </p>
          <a
            href="mailto:blog@ssfashion.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-black text-brand-white rounded-xl font-semibold hover:bg-brand-black/90 transition-colors"
          >
            Pitch a Story
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}