"use client";

export default function Footer() {
  return (
    <footer className="bg-black py-8 text-white">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-4 text-sm">
          Made by{" "}
          <a
            href="https://williamgiles.co.nz"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline"
          >
            William
          </a>{" "}
          —{" "}
          {
            "because I wasn't about to wait for those slow-ass car websites to load."
          }
        </p>
        <p className="text-xs">
          &copy; {new Date().getFullYear()} William. Now fuck off.
        </p>
      </div>
    </footer>
  );
}
