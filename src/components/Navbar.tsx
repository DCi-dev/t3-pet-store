import Image from "next/image";
import Link from "next/link";

import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  HeartIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { signIn, signOut, useSession } from "next-auth/react";
import { Fragment } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function NavBar() {
  const { data: sessionData } = useSession();

  const userProfileImageUrl = sessionData?.user?.image as string;

  return (
    <Disclosure as="nav" className="bg-neutral-900 shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-neutral-200 hover:bg-neutral-800 hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <Link href="/" className="flex flex-shrink-0 items-center">
                  <Image
                    className="block h-12 w-auto lg:hidden"
                    src="/assets/pet-store-logo.png"
                    alt="Your Company"
                    width={30}
                    height={30}
                  />
                  <Image
                    className="hidden h-12 w-auto lg:block"
                    src="/assets/pet-store-logo.png"
                    alt="Your Company"
                    width={30}
                    height={30}
                  />
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/"
                    className="inline-flex items-center border-b-2 border-yellow-500 px-1 pt-1 text-sm font-medium text-neutral-100"
                  >
                    Home
                  </Link>
                  <Link
                    href="/shop"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-neutral-200 hover:border-neutral-300 hover:text-neutral-300"
                  >
                    Shop
                  </Link>
                  <Link
                    href="#"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-neutral-200 hover:border-neutral-300 hover:text-neutral-300"
                  >
                    About
                  </Link>
                  <Link
                    href="#"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-neutral-200 hover:border-neutral-300 hover:text-neutral-300"
                  >
                    Contact
                  </Link>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <Link
                  href="/user/wishlist"
                  className="rounded-full  p-1 text-neutral-100 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Wishlist</span>
                  <HeartIcon className="h-6 w-6" aria-hidden="true" />
                </Link>

                <Link
                  href="/user/cart"
                  className="ml-3 rounded-full  p-1 text-neutral-100 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Shopping Cart</span>
                  <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                </Link>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex rounded-full text-sm text-neutral-100 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      {sessionData && (
                        <Image
                          src={userProfileImageUrl}
                          className="h-8 w-8 rounded-full"
                          aria-hidden="true"
                          alt="profile image"
                          width={30}
                          height={30}
                        />
                      )}
                      {!sessionData && (
                        <UserCircleIcon
                          className="h-8 w-8 rounded-full"
                          aria-hidden="true"
                        />
                      )}
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-neutral-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {sessionData && (
                        <>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="#"
                                className={classNames(
                                  active ? "bg-neutral-700" : "",
                                  "block px-4 py-2 text-sm text-neutral-100"
                                )}
                              >
                                Your Profile
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="#"
                                className={classNames(
                                  active ? "bg-neutral-700" : "",
                                  "block px-4 py-2 text-sm text-neutral-100"
                                )}
                              >
                                Orders
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <div
                                className={classNames(
                                  active ? "bg-neutral-700" : "",
                                  "block cursor-pointer px-4 py-2 text-sm text-neutral-100"
                                )}
                                onClick={() => signOut()}
                              >
                                Sign out
                              </div>
                            )}
                          </Menu.Item>
                        </>
                      )}
                      {!sessionData && (
                        <Menu.Item>
                          {({ active }) => (
                            <div
                              className={classNames(
                                active ? "bg-neutral-700" : "",
                                "block cursor-pointer px-4 py-2 text-sm text-neutral-100"
                              )}
                              onClick={() => signIn()}
                            >
                              Sign in
                            </div>
                          )}
                        </Menu.Item>
                      )}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pt-2 pb-4">
              {/* Current: "bg-yellow-50 border-yellow-500 text-yellow-700", Default: "border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700" */}
              <Disclosure.Button
                as="a"
                href="#"
                className="block border-l-4 border-yellow-500 bg-neutral-900 py-2 pl-3 pr-4 text-base font-medium text-neutral-100"
              >
                Home
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                href="#"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-neutral-100 hover:border-neutral-800 hover:bg-neutral-800 hover:text-neutral-300"
              >
                Shop
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                href="#"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-neutral-100 hover:border-neutral-800 hover:bg-neutral-800 hover:text-neutral-300"
              >
                About
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                href="#"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-neutral-100 hover:border-neutral-800 hover:bg-neutral-800 hover:text-neutral-300"
              >
                Contact
              </Disclosure.Button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
