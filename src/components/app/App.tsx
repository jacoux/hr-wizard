import clsx from 'clsx';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import {
	saveOrgSelectionToLocalStorage,
	useActiveOrg,
	useAuthInfo,
	useRedirectFunctions,
} from '../propelauth';
import { Layout } from './Layout';
import { propelAuthAtom } from './store';
import { useNavigateToReturnUrl } from './utils';

export function App() {
	const activeOrg = useActiveOrg();
	const auth = useAuthInfo();
	const { redirectToCreateOrgPage } = useRedirectFunctions();
	useNavigateToReturnUrl();

	if (auth.loading === false && auth.orgHelper && !activeOrg) {
		const orgs = auth.orgHelper.getOrgs();
		if (orgs.length === 0) {
			return (
				<div className="mt-20 flex flex-col gap-10">
					<h1 className="text-center text-2xl font-bold">First, create an organization:</h1>
					<div className="text-center">
						<button
							className="ml-2 rounded bg-blue-500 px-4 py-2 text-white"
							onClick={() => redirectToCreateOrgPage()}
						>
							Create an organization
						</button>
					</div>
				</div>
			);
		}

		return (
			<div className="mt-20 flex flex-col gap-10">
				<h1 className="text-center text-2xl font-bold">Please select an organization:</h1>
				<div className="text-center">
					<select
						className="rounded px-4  py-2"
						onChange={(e) => {
							if (e.target.value === 'create_org') {
								redirectToCreateOrgPage();
								return;
							}
							saveOrgSelectionToLocalStorage(e.target.value);
							window.location.reload();
						}}
					>
						<option value="">&nbsp;&nbsp;Select an organization</option>
						<option value="create_org">&nbsp;&nbsp;Create an organization</option>
						{orgs.map((org) => {
							return (
								<option key={org.orgId} value={org.orgId}>
									{org.orgName}
								</option>
							);
						})}
					</select>
				</div>
			</div>
		);
	}

	return (
		<Layout title="">
			<main className="bg-white">
				<div className="relative md:flex">
					{/* Content */}
					<div className="md:w-1/2">
						<div className="min-h-screen h-full flex flex-col after:flex-1">
							{/* Header */}
							<div className="flex-1">
								<div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
									{/* Logo */}
									<Link className="block" to="/">
										<svg width="32" height="32" viewBox="0 0 32 32">
											<defs>
												<linearGradient
													x1="28.538%"
													y1="20.229%"
													x2="100%"
													y2="108.156%"
													id="logo-a"
												>
													<stop stopColor="#A5B4FC" stopOpacity="0" offset="0%" />
													<stop stopColor="#A5B4FC" offset="100%" />
												</linearGradient>
												<linearGradient x1="88.638%" y1="29.267%" x2="22.42%" y2="100%" id="logo-b">
													<stop stopColor="#38BDF8" stopOpacity="0" offset="0%" />
													<stop stopColor="#38BDF8" offset="100%" />
												</linearGradient>
											</defs>
											<rect fill="#6366F1" width="32" height="32" rx="16" />
											<path
												d="M18.277.16C26.035 1.267 32 7.938 32 16c0 8.837-7.163 16-16 16a15.937 15.937 0 01-10.426-3.863L18.277.161z"
												fill="#4F46E5"
											/>
											<path
												d="M7.404 2.503l18.339 26.19A15.93 15.93 0 0116 32C7.163 32 0 24.837 0 16 0 10.327 2.952 5.344 7.404 2.503z"
												fill="url(#logo-a)"
											/>
											<path
												d="M2.223 24.14L29.777 7.86A15.926 15.926 0 0132 16c0 8.837-7.163 16-16 16-5.864 0-10.991-3.154-13.777-7.86z"
												fill="url(#logo-b)"
											/>
										</svg>
									</Link>
								</div>
							</div>

							<div className="max-w-sm mx-auto px-4 py-8">
								<h1 className="text-3xl text-slate-800 font-bold mb-6">
									Start for free with HR-wizard ✨
								</h1>
								{/* Form */}
								<AppWithOrg />

								{/* Footer */}
								{/* <div className="pt-5 mt-6 border-t border-slate-200">
                <div className="text-sm">
                  Have an account? <Link className="font-medium text-indigo-500 hover:text-indigo-600" to="/signin">Sign In</Link>
                </div>
              </div> */}
							</div>
						</div>
					</div>

					{/* Image */}
					<div
						className="hidden md:block absolute top-0 bottom-0 right-0 md:w-1/2"
						aria-hidden="true"
					>
						<img
							className="object-cover object-center w-full h-full"
							src="https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?q=80&w=2976&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
							width="760"
							height="1024"
							alt="Authentication"
						/>
					</div>
				</div>
			</main>
		</Layout>
	);
}

const AppWithOrg = () => {
	const setAtom = useSetAtom(propelAuthAtom);
	const activeOrg = useActiveOrg();
	const auth = useAuthInfo();
	const [propelDied, setPropelDied] = useState(false);
	useEffect(() => {
		setPropelDied(false);
		if (auth.loading === true) {
			const timer = setTimeout(() => {
				setPropelDied(true);
			}, 3000);
			return () => clearTimeout(timer);
		}
		return;
	}, [auth.loading]);

	if (auth.loading === false) {
		if (!auth.user) {
			return (
				<div className="text-center">
					<a className="rounded  bg-indigo-500 px-4 py-2 text-white" href="/login">
						Sign up or Sign in
					</a>
				</div>
			);
		}
		return (
			<>
				{activeOrg && (
					<div className="mt-4">
						Hello, {auth.user.email} ({activeOrg.orgName})
					</div>
				)}
				<div className="mt-4 text-center">
					<NavLink
						to="/dashboard"
						className={({ isPending }) =>
							clsx('rounded  px-4 py-2 text-white', isPending ? 'bg-indigo-600' : 'bg-indigo-500')
						}
					>
						Go to all jobs in this organization
					</NavLink>
				</div>
			</>
		);
	}

	if (propelDied) {
		return (
			<>
				<div className="mt-4">
					Oops, looks like PropelAuth is down. You can{' '}
					<a
						className="text-blue-700 underline visited:text-purple-600 hover:text-rose-600"
						href="https://twitter.com/propelauth"
					>
						tweet at them
					</a>{' '}
					with a screenshot of the error from your dev tools or a note with "got a 503 on mobile".
					This page will try to reconnect on its own, but you can also retry manually:
				</div>
				<div className="mt-4 text-center">
					<button
						className="rounded bg-indigo-500 px-4 py-2 text-white
					transition-colors duration-200 hover:bg-indigo-600"
						onClick={() => {
							setAtom((x) => x + 1);
						}}
					>
						Retry
					</button>
				</div>
			</>
		);
	}

	return <div className="container mx-4 my-10">Loading...</div>;
};
