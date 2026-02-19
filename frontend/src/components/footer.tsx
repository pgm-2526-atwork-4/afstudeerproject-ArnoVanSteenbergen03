import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-6 text-center text-sm text-slate-600">
      <div className="flex justify-center gap-2 mb-2">
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
        <span>•</span>
        <Link href="/terms" className="hover:underline">
          Terms of Service
        </Link>
      </div>
      <p>
        © 2026{" "}
        <a
          href="https://letssavefood.be"
          className="text-orange-600 hover:underline"
        >
          Let&apos;s save food
        </a>
        . All rights reserved.
      </p>
      <p>
        In collaberation with{" "}
        <a
          href="https://avsworks.be"
          className="text-orange-600 hover:underline"
        >
          AVS Works
        </a>
      </p>
    </footer>
  );
}
