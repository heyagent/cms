'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { changelogAPI, blogAPI, type BlogStats } from '@/lib/api';
import { FileText, Hash, Clock, Tag, Folder, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    changelog: 0,
    blog: 0,
    categories: 0,
    tags: 0,
  });
  const [blogStats, setBlogStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch both changelog and blog stats in parallel
      const [changelogStats, blogStatsResponse] = await Promise.all([
        changelogAPI.getStats(),
        blogAPI.getStats(),
      ]);

      setBlogStats(blogStatsResponse.data);
      setStats({
        changelog: changelogStats.data.total,
        blog: blogStatsResponse.data.totalPosts,
        categories: blogStatsResponse.data.totalCategories,
        tags: blogStatsResponse.data.totalTags,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 md:mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400">
          Welcome to HeyAgent CMS. Manage your content from here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Blog Posts Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blog Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : stats.blog}
            </div>
          </CardContent>
        </Card>

        {/* Changelog Entries Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Changelog Entries</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : stats.changelog}
            </div>
          </CardContent>
        </Card>

        {/* Categories Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : stats.categories}
            </div>
          </CardContent>
        </Card>

        {/* Tags Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : stats.tags}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Popular Tags Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Blog Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Blog Posts</CardTitle>
            <Button variant="link" size="sm" asChild>
              <Link href="/admin/blog">View all →</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : blogStats?.recentPosts && blogStats.recentPosts.length > 0 ? (
              <div className="space-y-3">
                {blogStats.recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/admin/blog/${post.id}/edit`}
                    className="block group"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium group-hover:text-primary truncate">
                          {post.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary rounded-full mb-3">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No blog posts yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Tags */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Popular Tags</CardTitle>
            <Button variant="link" size="sm" asChild>
              <Link href="/admin/tags">View all →</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-wrap gap-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            ) : blogStats?.popularTags && blogStats.popularTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {blogStats.popularTags.slice(0, 10).map((tag, index) => (
                  <Link
                    key={tag.tag}
                    href={`/admin/blog?tag=${encodeURIComponent(tag.tag)}`}
                  >
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      <Hash className="w-3 h-3 mr-1" />
                      {tag.tag}
                      <span className="ml-1.5 text-xs opacity-70">({tag.count})</span>
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary rounded-full mb-3">
                  <Hash className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No tags yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}