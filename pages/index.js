// pages/index.js
// Landing page with hero section and feature showcase

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Check if user is already logged in
    if (!isLoading && user) {
      console.log('User already logged in, redirecting to dashboard');
      // router.push('/dashboard')
    }
  }, [isLoading, user, router]);

  return (
    <Layout hideNav={true}>
      <div className="min-h-screen">
        <header className="bg-blue-950 py-4 shadow-lg">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="text-white font-extrabold text-2xl tracking-tight">TB12<span className="text-blue-400">.LFG</span></div>
            <div>
              <Link href="/login" className="text-white hover:text-blue-300 font-medium px-4 py-2 rounded-lg hover:bg-blue-800/30 transition-all">
                Sign In
              </Link>
            </div>
          </div>
        </header>

        <section className="relative text-white py-20 px-4 overflow-hidden">
          {/* Background with gradient */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
            {/* Pattern overlay for texture */}
            <div className="absolute inset-0 opacity-15"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '20px 20px' }}></div>

            {/* Transparent image with blend mode */}
            <img
              src="images/257f7448-1bcf-4776-9f2c-7a692aa93cd0.png"
              alt="TB12 Background"
              className="w-full h-full object-cover mix-blend-overlay opacity-75"
            />

                  <div className="absolute inset-0 bg-gradient-to-t from-black-950 to-transparent opacity-80"></div>
                  </div>

                  <div className="container mx-auto max-w-6xl relative z-10">
                  <div className="flex flex-col md:flex-row items-center md:space-x-8">
                    <div className="md:w-3/5 mb-10 md:mb-0">
                    <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-white drop-shadow-lg bg-clip-text bg-gradient-to-r from-white to-blue-200">
                      TB12.LFG – Where Brady Fans Go Beyond the Game
                    </h1>
                    <p className="text-xl md:text-2xl mb-10 text-blue-100 leading-relaxed drop-shadow-md max-w-xl">
                      Join the ultimate community for true fans. Exclusive NFTs, merchandise, and experiences await.
                    </p>
                    <Link href="/login" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 py-4 px-12 rounded-lg font-bold text-lg transition duration-300 inline-block shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                      Get Started
                    </Link>
                    </div>
                    <div className="md:w-2/5">
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl shadow-2xl border border-white/20">
                      <img
                      src="/images/f6d671cb-f340-450d-a656-ef66bf8a9874.png"
                      alt="TB12 NFT Collection"
                      className="rounded-lg w-full p-4 shadow-lg"
                      />
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-700 to-blue-500 backdrop-blur rounded-lg shadow-lg border border-white/20">
                      <p className="text-lg font-bold text-white text-center">
                        Exclusive TB12 NFT Collection
                      </p>
                      </div>
                    </div>
                    </div>
                  </div>
                  </div>
                </section>

                <section className="py-16 px-4 bg-gradient-to-br from-blue-900 to-blue-800 text-white relative overflow-hidden">
                  <div className="container mx-auto max-w-5xl relative z-10">
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 mb-8 md:mb-0 md:pr-10">
                    <div className="relative rounded-lg overflow-hidden shadow-xl transform transition-all hover:scale-105 duration-300 group">
                      <img
                      src="images/dalle3-5baca772-d34d-4d84-adc8-5685bd50b469-150028.jpg"
                      alt="NFT Membership"
                      className="rounded-lg w-full p-4 transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/500x400?text=NFT+Membership' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <span className="bg-blue-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">Premium Collection</span>
                      </div>
                    </div>
                    </div>
                    <div className="md:w-1/2">
                    <h2 className="text-3xl font-bold text-white mb-4">Exclusive NFT Membership</h2>
                    <p className="text-lg text-blue-100 mb-6">
                      Own a piece of the legend. Our NFT collection gives you exclusive access to premium content,
                      members-only events, and special merchandise discounts.
                    </p>
                    <ul className="mb-8 space-y-2">
                      <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Limited edition digital collectibles</span>
                      </li>
                      <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Early access to new merchandise</span>
                      </li>
                      <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Exclusive community events</span>
                      </li>
                    </ul>
                    <Link href="/login" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-8 rounded-lg font-bold text-lg transition duration-300 inline-block shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                      Join Now
                    </Link>
                    </div>
                  </div>
                  </div>
                </section>

                  <section className="py-16 px-4 bg-gradient-to-br from-blue-900 to-blue-800 text-white relative overflow-hidden">
                    {/* Background pattern and image */}
                    <div className="absolute inset-0 z-0 opacity-15">
                      <img
                        src="images/dalle3-3379da65-6312-4c8e-b83c-565cc971654c-150734.jpg"
                        alt="Community Background"
                        className="w-full h-full object-cover mix-blend-overlay"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-950 to-transparent opacity-60"></div>
                    </div>

                    <div className="container mx-auto max-w-5xl relative z-10">
                      <div className="flex flex-col md:flex-row-reverse items-center">
                        <div className="md:w-1/2 mb-8 md:mb-0 md:pl-10">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-300 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          src="images/dalle3-9bf43311-0f66-4ed1-9347-9a884b934b3d-145839.jpg"
                          alt="Fan Community"
                          className="rounded-lg shadow-lg w-full transform transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/500x400?text=Fan+Community' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent opacity-70"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="bg-blue-600/30 backdrop-blur-md rounded-lg p-2 inline-block">
                      <span className="text-white font-bold">Community Hub</span>
                          </div>
                        </div>
                      </div>
                    </div>
                        </div>
                        <div className="md:w-1/2">
                    <h2 className="text-3xl font-bold text-white mb-4">Connect with True Fans</h2>
                    <p className="text-lg text-blue-100 mb-6">
                      Join a passionate community of Brady fans. Participate in challenges, discussions,
                      and exclusive events with fellow enthusiasts around the world.
                    </p>
                    <ul className="mb-8 space-y-2">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-blue-50">Weekly challenges and competitions</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-blue-50">Fan forums and discussions</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-blue-50">Virtual watch parties and events</span>
                      </li>
                    </ul>
                    <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-bold text-lg transition duration-300 inline-block shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                      Join the Community
                    </Link>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Merch Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-blue-900 to-blue-800 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 z-0">
            <img
              src="images/dalle3-ab0fa95f-a72c-4208-b11e-d48fa6db63a3-150650.jpg"
              alt="Merch Background"
              className="w-full h-full object-cover opacity-25 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-blue-900/70"></div>
          </div>

          <div className="container mx-auto max-w-5xl relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Exclusive Merchandise</h2>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Get your hands on limited edition merchandise. NFT holders get special perks,
                early access, and exclusive discounts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Merch Item 1 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/10">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src="images/dalle3-9bf43311-0f66-4ed1-9347-9a884b934b3d-145839.jpg"
                    alt="Premium Jersey"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = `https://via.placeholder.com/300x200?text=Merch+Item+1` }}
                  />
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    NEW
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white">TB12 Premium Jersey</h3>
                  <p className="text-blue-100 text-sm mt-1">Exclusive design for true fans.</p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="font-bold text-lg text-white">$79.99</span>
                    <span className="text-xs bg-blue-600/30 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                      NFT Discount Available
                    </span>
                  </div>
                </div>
              </div>

              {/* Merch Item 2 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/10">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src="images/dalle3-5baca772-d34d-4d84-adc8-5685bd50b469-150028.jpg"
                    alt="Limited Edition Cap"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = `https://via.placeholder.com/300x200?text=Merch+Item+2` }}
                  />
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    HOT
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white">Limited Edition Cap</h3>
                  <p className="text-blue-100 text-sm mt-1">Premium embroidered design.</p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="font-bold text-lg text-white">$39.99</span>
                    <span className="text-xs bg-blue-600/30 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                      NFT Discount Available
                    </span>
                  </div>
                </div>
              </div>

              {/* Merch Item 3 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/10">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src="images/dalle3-af7309b1-863f-40c5-be5b-e639fe14ffec-150604.jpg"
                    alt="Collector's Edition"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = `https://via.placeholder.com/300x200?text=Merch+Item+3` }}
                  />
                  <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    RARE
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white">Collector's Edition Bundle</h3>
                  <p className="text-blue-100 text-sm mt-1">Limited quantity premium set.</p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="font-bold text-lg text-white">$129.99</span>
                    <span className="text-xs bg-blue-600/30 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                      NFT Discount Available
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-bold text-lg transition duration-300 inline-block">
                Shop Now
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 relative overflow-hidden text-white">
          {/* Background image with overlay */}
          <div className="absolute inset-0">
            {/* <img
              src="images/dalle3-af7309b1-863f-40c5-be5b-e639fe14ffec-150604.jpg"
              alt="CTA Background"
              className="w-full h-full object-cover"
            /> */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/90"></div>
          </div>

          <div className="container mx-auto max-w-5xl text-center relative z-10">
            <div className="bg-blue-900/30 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-md">Ready to Join the Ultimate Brady Fan Community?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Get started today and experience exclusive content, NFT benefits, and connect with fans just like you.
              </p>
              <Link href="/login" className="bg-white text-blue-900 hover:bg-blue-100 py-3 px-10 rounded-lg font-bold text-lg transition duration-300 inline-block shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Sign Up Now
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}