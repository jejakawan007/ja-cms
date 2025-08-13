import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Code, Database, Globe, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">JA-CMS</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/docs" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Login
              </Link>
              <Button asChild>
                <Link href="/dashboard">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            Modern Content Management System
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Build Better
            <span className="bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent"> Content</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            A modern, full-stack content management system built with Next.js, TypeScript, and Shadcn/ui. 
            Manage your content with ease and style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs">
                View Documentation
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to build and manage modern content
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Built with Next.js 14 and optimized for performance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <CardTitle>Secure by Default</CardTitle>
              <CardDescription>
                Enterprise-grade security with authentication and authorization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <CardTitle>Modern Database</CardTitle>
              <CardDescription>
                PostgreSQL with Prisma ORM for type-safe database operations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <CardTitle>Beautiful UI</CardTitle>
              <CardDescription>
                Shadcn/ui components with dark mode and responsive design
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <CardTitle>TypeScript</CardTitle>
              <CardDescription>
                Full TypeScript support for better development experience
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <ArrowRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <CardTitle>Ready to Deploy</CardTitle>
              <CardDescription>
                Docker support and easy deployment to any platform
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="container mx-auto px-4 py-20">
        <Separator className="mb-16" />
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Built with Modern Tech
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Cutting-edge technologies for the best development experience
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Next.js 14</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">React framework with App Router</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">PostgreSQL</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Reliable database with Prisma ORM</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">TypeScript</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Type-safe development</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shadcn/ui</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Beautiful UI components</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">JA-CMS</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Modern content management system for the web.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Features</Link></li>
                <li><Link href="/docs" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Documentation</Link></li>
                <li><Link href="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">About</Link></li>
                <li><Link href="/blog" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Blog</Link></li>
                <li><Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Help Center</Link></li>
                <li><Link href="/status" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Status</Link></li>
                <li><Link href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-300">
              © 2024 JA-CMS. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Privacy
              </Link>
              <Link href="/cookies" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
