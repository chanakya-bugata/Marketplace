import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Store, Users, TrendingUp } from 'lucide-react'

const HomePage = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Welcome to <span className="text-primary">Marketplace</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover amazing products from trusted vendors around the world. 
          Start shopping or become a vendor today!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/products">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Start Shopping
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/register">
              <Store className="mr-2 h-5 w-5" />
              Become a Vendor
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Marketplace?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="mr-2 h-6 w-6 text-primary" />
                Wide Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Browse thousands of products from verified vendors across multiple categories.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-6 w-6 text-primary" />
                Trusted Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Join a community of trusted buyers and sellers with verified profiles and reviews.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-primary" />
                Grow Your Business
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Vendors get access to powerful tools to manage inventory, orders, and analytics.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-muted rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-8">
          Join thousands of satisfied customers and vendors on our platform.
        </p>
        <Button asChild size="lg">
          <Link to="/register">Sign Up Today</Link>
        </Button>
      </section>
    </div>
  )
}

export default HomePage