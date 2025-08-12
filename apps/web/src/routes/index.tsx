import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type PdfItem = {
	id: number;
	filename: string;
	createdAt: string;
};

export const Route = createFileRoute("/")({
	component: HomeDashboard,
});

function HomeDashboard() {
	const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
	const [pdfs, setPdfs] = useState<PdfItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const skeletonKeys = ["s1", "s2", "s3", "s4"];

	useEffect(() => {
		let active = true;
		async function load() {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`${apiBase}/pdfs`);
				if (!res.ok) throw new Error(`Falha ao buscar PDFs: ${res.status}`);
				const data: PdfItem[] = await res.json();
				if (active) setPdfs(data);
			} catch (e) {
				if (active) setError((e as Error).message);
			} finally {
				if (active) setLoading(false);
			}
		}
		load();
		return () => {
			active = false;
		};
	}, [apiBase]);

	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="border-b bg-card text-card-foreground">
				<div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
					<h1 className="text-xl font-semibold">PDF Dashboard</h1>
					<nav className="flex items-center gap-4 text-sm">
						<Link to="/upload" className="text-muted-foreground hover:underline">
							Upload
						</Link>
						<a
							href="https://github.com/felipebrgs1/PDFReactView"
							target="_blank"
							rel="noreferrer"
							className="text-muted-foreground hover:underline"
						>
							Repo
						</a>
					</nav>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-4 py-6">
				<section className="mb-6">
					<div className="rounded-lg border bg-card text-card-foreground p-4">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-lg font-medium">Arquivos PDF</h2>
								<p className="text-sm text-muted-foreground">
									Clique para abrir
								</p>
							</div>
							<div className="text-xs text-muted-foreground">
								{loading ? "Carregando…" : `${pdfs.length} itens`}
							</div>
						</div>
						<div className="mt-4">
							{error && <div className="text-sm text-red-600">{error}</div>}
							{!error && loading && (
								<ul className="space-y-2">
									{skeletonKeys.map((k) => (
										<li
											key={k}
											className="h-10 animate-pulse rounded bg-muted"
										/>
									))}
								</ul>
							)}
							{!error && !loading && pdfs.length === 0 && (
								<div className="text-sm text-muted-foreground">
									Nenhum PDF encontrado.
								</div>
							)}
							{!error && !loading && pdfs.length > 0 && (
								<ul className="divide-y rounded-md border">
									{pdfs.map((p) => {
										const viewPath = `/view/${p.id}`;
										const when = p.createdAt
											? new Date(p.createdAt).toLocaleString()
											: "";
										return (
											<li key={p.id} className="group">
												<a
													href={viewPath}
													className="flex items-center justify-between px-4 py-3 hover:bg-accent hover:text-accent-foreground"
												>
													<div className="min-w-0">
														<div className="truncate font-medium">
															{p.filename}
														</div>
														<div className="text-xs text-muted-foreground truncate">
															{viewPath}
														</div>
													</div>
													<div className="ml-4 text-xs text-muted-foreground whitespace-nowrap">
														{when}
													</div>
												</a>
											</li>
										);
									})}
								</ul>
							)}
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
