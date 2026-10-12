import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* Navbar */}
      <header className="border-b-0 bg-green-900 ">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          {/* Logo */}
          <Link href="/" className="text-white text-2xl font-bold">
            BizPulse
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-white hover:text-gray-300"
            >
              Features
            </a>

            <a
              href="#analytics"
              className="text-sm text-white hover:text-gray-300"
            >
              Analytics
            </a>

            <a
              href="#about"
              className="text-sm text-white hover:text-gray-300"
            >
              About
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-green-600 hover:text-white"
            >
              Sign In
            </Link>

           <Link
  href="/register"
  className="rounded-full bg-white px-4 py-2 text-sm font-medium  hover:bg-green-600 hover:text-white"
>
  Sign Up
</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">

          <div className="mx-auto max-w-3xl text-center">

            <div className="mb-6 inline-flex rounded-full text-green-900  bg-white px-4 py-2 text-sm text-gray-600 shadow-lg">
            Smarter Insights, Better Decisions
            </div>

            <h1 className="text-4xl font-bold text-green-900 tracking-tight md:text-6xl">
              Understand Your Business
              <span className="block text-green-600">
                With Better Analytics
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-green-700">
              BizPulse helps businesses monitor revenue, analyze sales,
              understand customers and make data-driven decisions from one
              powerful platform.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

             <Link
  href="/dashboard"
  className="rounded-full bg-green-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-500"
>
  Get Started
</Link>

              

            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section
        id="analytics"
        className="mx-auto max-w-7xl px-6 py-20"
      >

        <div className="text-center">
          <p className="text-sm font-medium text-green-900">
           BUSINESS PERFORMANCE
          </p>

          <h2 className="mt-2 text-3xl text-green-900 font-bold">
           Your Data. Your Insights. One Platform
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-green-700">
            Track your most important business metrics and monitor performance
            from a single centralized workspace.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="mt-12 overflow-hidden rounded-3xl  bg-green-100 shadow-xl">

          {/* Mockup Header */}
          <div className="flex items-center justify-between bg-white px-6 py-4">

            <div>
              <h3 className="font-semibold text-green-900">
                Business Overview
              </h3>

              <p className="text-sm text-green-700">
                Last 30 days
              </p>
            </div>

            <div className="rounded-lg  bg-white px-3 py-2 text-sm text-gray-600">
              June 2026
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-4">

            <div className="rounded-xl  bg-white p-5">
              <p className="text-sm text-gray-500">
                Revenue
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                AED 284,520
              </h3>

              <p className="mt-2 text-sm text-green-600">
                ↑ 18.4%
              </p>
            </div>

            <div className="rounded-xl  bg-white p-5">
              <p className="text-sm text-gray-500">
                Orders
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                12,482
              </h3>

              <p className="mt-2 text-sm text-green-600">
                ↑ 12.5%
              </p>
            </div>

            <div className="rounded-xl  bg-white p-5">
              <p className="text-sm text-gray-500">
                Customers
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                8,421
              </h3>

              <p className="mt-2 text-sm text-green-600">
                ↑ 8.2%
              </p>
            </div>

            <div className="rounded-xl  bg-white p-5">
              <p className="text-sm text-gray-500">
                Conversion
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                4.82%
              </h3>

              <p className="mt-2 text-sm text-green-600">
                ↑ 1.4%
              </p>
            </div>

          </div>

          {/* Chart Mockup */}
          <div className="grid grid-cols-1 gap-6 px-6 pb-6 lg:grid-cols-3">

            <div className="rounded-xl  bg-white p-6 lg:col-span-2">

              <h3 className="font-semibold text-green-900">
                Revenue Overview
              </h3>

              <p className="mt-1 text-sm text-green-700">
                Monthly revenue performance
              </p>

              <div className="mt-8 flex h-48 items-end gap-4">

                <div className="h-[35%] flex-1 rounded-t-md bg-green-200"></div>

                <div className="h-[48%] flex-1 rounded-t-md bg-green-300"></div>

                <div className="h-[42%] flex-1 rounded-t-md bg-green-200"></div>

                <div className="h-[62%] flex-1 rounded-t-md bg-green-400"></div>

                <div className="h-[75%] flex-1 rounded-t-md bg-green-500"></div>

                <div className="h-[90%] flex-1 rounded-t-md bg-green-900"></div>

              </div>

              <div className="mt-3 flex justify-between text-xs text-gray-400">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>

            </div>

            {/* Top Products */}
            <div className="rounded-xl  bg-white p-6">

              <h3 className="font-semibold text-green-900">
                Top Products
              </h3>

              <p className="mt-1 text-sm text-green-700">
                Best performing
              </p>

              <div className="mt-6 space-y-5">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pro Plan</p>
                    <p className="text-xs text-gray-500">
                      1,248 sales
                    </p>
                  </div>

                  <span className="font-semibold">
                    AED 37K
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Basic Plan</p>
                    <p className="text-xs text-gray-500">
                      986 sales
                    </p>
                  </div>

                  <span className="font-semibold">
                    AED 9K
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enterprise</p>
                    <p className="text-xs text-gray-500">
                      542 sales
                    </p>
                  </div>

                  <span className="font-semibold">
                    AED 32K
                  </span>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className=" bg-gray-50"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="text-center">
            <p className="text-sm font-medium text-green-900">
              FEATURES
            </p>

            <h2 className="mt-2 text-3xl text-green-900 font-bold">
             Designed for Business Success
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">

            <div className="rounded-xl  bg-white p-6 shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-900 text-white">
                ↗
              </div>

              <h3 className="mt-5 text-lg text-green-900 font-semibold">
                Business Analytics
              </h3>

              <p className="mt-2 text-sm leading-6 text-green-700">
                Monitor revenue, sales, customers and business growth with
                clear analytics.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-900 text-white">
                $
              </div>

              <h3 className="mt-5 text-lg text-green-900 font-semibold">
                Sales Tracking
              </h3>

              <p className="mt-2 text-sm leading-6 text-green-700">
                Track transactions, products, orders and sales performance
                from one place.
              </p>
            </div>

            <div className="rounded-xl  bg-white p-6 shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-900 text-white">
                ✓
              </div>

              <h3 className="mt-5 text-lg text-green-900 font-semibold">
                Data-Driven Decisions
              </h3>

              <p className="mt-2 text-sm leading-6 text-green-700">
                Turn business data into meaningful insights and make better
                decisions.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="mx-auto max-w-7xl px-6 py-20"
      >

        <div className="mx-auto max-w-3xl text-center">

          <h2 className="text-3xl font-bold text-green-900">
           Real-Time Insights. Smarter Decisions.
          </h2>

          <p className="mt-4 leading-8 text-green-700">
            BizPulse brings your most important business information together in one powerful analytics workspace. From revenue and customer growth to sales activity and product performance, BizPulse gives you a clear view of what’s happening across your business, helping you understand your data and make smarter decisions.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block rounded-full bg-green-900 px-6 py-3 font-medium text-white hover:bg-gray-500"
          >
            Start Using BizPulse
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer className=" bg-gray-50">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 md:flex-row">

          <div>
            <p className="font-semibold text-green-900">
              BizPulse
            </p>

            <p className="mt-1 text-sm text-green-700">
            Business Performance Platform
            </p>
          </div>

          <p className="text-sm text-gray-500">
            © 2026 BizPulse. All rights reserved.
          </p>

        </div>

      </footer>

    </main>
  );
}