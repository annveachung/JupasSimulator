import JupasHeader from "@/components/JupasHeader";
import ChoiceForm from "@/components/ChoiceForm";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f9fafb" }}>
      <JupasHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div
          className="mb-6 px-5 py-4 rounded border"
          style={{ backgroundColor: "#ffffff", borderColor: "#d1d5db" }}
        >
          <h1 className="text-base font-bold text-gray-900 mb-1">
            JUPAS 2026 — Programme Choice Submission
          </h1>
          <p className="text-xs text-gray-600 leading-relaxed">
            Please enter your programme choices in order of preference. Choice 1 is your most
            preferred programme. Search by programme name, JUPAS code, or institution name.
            All unfilled choices will be left blank.
          </p>
        </div>

        <div
          className="rounded border px-5 py-6"
          style={{ backgroundColor: "#ffffff", borderColor: "#d1d5db" }}
        >
          <ChoiceForm />
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-4">
        JUPAS Results Simulator · For simulation purposes only
      </footer>
    </div>
  );
}
