"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ReactNode, Suspense, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

import { AccountChecker } from "../account/account-ui";
import {
  ClusterChecker,
  ClusterUiSelect,
  ExplorerLink,
} from "../cluster/cluster-ui";
import { WalletButton } from "../solana/solana-provider";

export function UiLayout({
  children,
  links,
}: {
  children: ReactNode;
  links: { label: string; path: string }[];
}) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="navbar bg-base-300 dark:text-neutral-content px-4">
        {/* Logo */}
        <div className="flex-1 lg:flex-none">
          <Link className="btn btn-ghost normal-case text-xl" href="/">
            Attention Vault
          </Link>
        </div>

        {/* Desktop Navigation - Centered */}
        <div className="hidden lg:flex flex-1 justify-center">
          <ul className="menu menu-horizontal px-1 space-x-4">
            {links.map(({ label, path }) => (
              <li key={path}>
                <Link
                  className={`text-lg font-medium ${
                    pathname.startsWith(path) ? "text-primary" : ""
                  }`}
                  href={path}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Wallet and Mobile Navigation */}
        <div className="flex gap-2 items-center">
          {/* Always visible wallet button */}
          <WalletButton />

          {/* Show Sonic SVM on desktop only */}
          <div className="hidden lg:block">
            <ClusterUiSelect />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              className="btn btn-ghost btn-circle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - Shown as a drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-200 ease-in-out`}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMenuOpen(false)}
        ></div>
        <div className="absolute right-0 top-0 h-full w-64 bg-base-100 shadow-xl">
          <div className="p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Menu</h2>
              <button
                className="btn btn-ghost btn-circle"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Show Sonic SVM in mobile sidebar */}
            <div className="lg:hidden flex justify-center">
              <ClusterUiSelect />
            </div>
            <ul className="menu menu-vertical w-full">
              {links.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    className={
                      pathname.startsWith(path) ? "active bg-base-300" : ""
                    }
                    href={path}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ClusterChecker>
        <AccountChecker />
      </ClusterChecker>
      <div className="flex-grow">
        <Suspense
          fallback={
            <div className="text-center my-32">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          }
        >
          {children}
        </Suspense>
        <Toaster position="bottom-right" />
      </div>
      {/* <footer className="footer footer-center p-4 bg-base-300 text-base-content">
        
      </footer> */}
    </div>
  );
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode;
  title: string;
  hide: () => void;
  show: boolean;
  submit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show, dialogRef]);

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box space-y-5">
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
        <div className="modal-action">
          <div className="join space-x-2">
            {submit ? (
              <button
                className="btn btn-xs lg:btn-md btn-primary"
                onClick={submit}
                disabled={submitDisabled}
              >
                {submitLabel || "Save"}
              </button>
            ) : null}
            <button onClick={hide} className="btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function AppHero({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
}) {
  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          {typeof title === "string" ? (
            <h1 className="text-5xl font-bold">{title}</h1>
          ) : (
            title
          )}
          {typeof subtitle === "string" ? (
            <p className="py-6">{subtitle}</p>
          ) : (
            subtitle
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function ellipsify(str = "", len = 4) {
  if (str.length > 30) {
    return (
      str.substring(0, len) + ".." + str.substring(str.length - len, str.length)
    );
  }
  return str;
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className={"text-center"}>
        <div className="text-lg">Transaction sent</div>
        <ExplorerLink
          path={`tx/${signature}`}
          label={"View Transaction"}
          className="btn btn-xs btn-primary"
        />
      </div>
    );
  };
}
