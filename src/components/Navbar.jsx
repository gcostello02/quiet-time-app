import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  PencilSquareIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { useNavigate, useLocation, Link } from "react-router-dom"
import { UserAuth } from "../context/AuthContext"
import React from "react"
import logo from '../assets/logo.png'

const navigationItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Bible', href: '/bible' },
  { name: 'Feed', href: '/feed' }
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const { signOut, profile } = UserAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async (e) => {
    e.preventDefault()
    try {
      await signOut()
      navigate("/")
    } catch (err) {
      console.log("An unexpected error occurred ", err)
    }
  }

  return (
    <Disclosure as="nav" className="bg-white border-b border-gray-300 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Mobile Menu Toggle */}
          <div className="flex items-center sm:hidden">
            <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 bg-white text-gray-900 hover:bg-gray-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="block size-6 group-data-open:hidden" aria-hidden="true" />
              <XMarkIcon className="hidden size-6 group-data-open:block" aria-hidden="true" />
            </DisclosureButton>
          </div>

          {/* Logo */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <img
                alt="TAWG"
                src={logo}
                className="h-10 w-auto"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      "px-3 py-2 text-sm font-medium rounded-md border-b-2 border-transparent",
                      location.pathname === item.href
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "text-gray-900 hover:bg-gray-100 hover:text-black"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Icons (Pencil and User Group) */}
          <div className="hidden sm:flex items-center space-x-4 mr-4">
            <button
              onClick={() => navigate("/tawg")}
              className="rounded-full bg-gray-100 p-2 text-gray-900 hover:text-black focus:ring-2 focus:ring-gray-300"
            >
              <span className="sr-only">Go to TAWG</span>
              <PencilSquareIcon className="size-6" aria-hidden="true" />
            </button>

            <button
              onClick={() => navigate("/friends")}
              className="rounded-full bg-gray-100 p-2 text-gray-900 hover:text-black focus:ring-2 focus:ring-gray-300"
            >
              <span className="sr-only">View Friends</span>
              <UserGroupIcon className="size-6" aria-hidden="true" />
            </button>
          </div>

          {/* Profile Icon: Always visible */}
          <div className="flex items-center space-x-4">
            <Menu as="div" className="relative">
              <div>
                <MenuButton className="relative flex rounded-full bg-gray-100 text-sm focus:ring-2 focus:ring-gray-300">
                  <span className="sr-only">Open user menu</span>
                  <img
                    alt="User"
                    src={profile?.avatar_url || "https://fkyfymxgbyyznrctanvs.supabase.co/storage/v1/object/public/profile-pictures/avatars/logo.png"}
                    className="size-8 rounded-full"
                  />
                </MenuButton>
              </div>
              <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 transition focus:outline-none">
                <MenuItem>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                  >
                    Your Profile
                  </Link>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-900 bg-white hover:bg-gray-100 cursor-pointer"
                  >
                    Sign out
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigationItems.map((item) => (
            <DisclosureButton
              key={item.name}
              as={Link}
              to={item.href}
              className={classNames(
                location.pathname === item.href
                  ? "bg-indigo-600 text-white"
                  : "text-gray-900 hover:bg-gray-100 hover:text-black",
                "block rounded-md px-3 py-2 text-base font-medium"
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}

          {/* Mobile Links for TAWG and Friends */}
          <DisclosureButton
            as={Link}
            to="/tawg"
            className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100"
          >
            Do your TAWG
          </DisclosureButton>

          <DisclosureButton
            as={Link}
            to="/friends"
            className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100"
          >
            Friends
          </DisclosureButton>
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}