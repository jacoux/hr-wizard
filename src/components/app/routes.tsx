import type { QueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { Outlet, type RouteObject } from 'react-router-dom';

import { env } from '../../config';
import type { Helpers } from '../../lib/trpc/root';
import { AuthSync } from '../AuthSync';
import { FullPageSupport, SupportWidget } from '../fogbender/Support';
import { AuthProvider } from '../propelauth';
import type { RouterUtils } from '../trpc';
import { App } from './App';
import { CreatePrompt } from './CreatePrompt';
import { EditPrompt } from './EditPrompt';
import { Jobs } from './jobs/Jobs';
import { AppNav } from './Nav';
import { Prompt } from './Prompt';
import { Prompts } from './Prompts';
import { Settings } from './Settings';
import { propelAuthAtom } from './store';

export const routes: RemixBrowserContext & RouteObject[] = [
	{
		path: '/prompts/:promptId',
		loader: async ({ params }) => {
			const promptId = params.promptId;
			if (promptId) {
				// pre-fetch in SSR is done oustide of the loader in .astro file
				// pre-fetch in browser
				await routes.trpcUtils?.prompts.getPrompt.ensureData({ promptId }).catch(() => {});
			}
			return null;
		},
		Component() {
			return <Prompt />;
		},
	},
	{
		path: '/dashboard',
		Component() {
			const key = useAtomValue(propelAuthAtom);
			return (
				<AuthProvider key={key} authUrl={env.PUBLIC_AUTH_URL}>
					<AuthSync />
					<AppNav />
					<Outlet />
					<SupportWidget kind="floatie" />
				</AuthProvider>
			);
		},
		children: [
			{
				index: true,
				Component() {
					return <App />;
				},
			},
			{
				path: '/dashboard/prompts',
				loader: async ({ context }) => {
					// pre-fetch in SSR
					await context?.helpers.prompts.getPrompts.prefetch({});
					// pre-fetch in browser
					await routes.trpcUtils?.prompts.getPrompts.ensureData({}).catch(() => {});
					return null;
				},
				Component() {
					return <Prompts />;
				},
			},
			{
				path: '/dashboard/jobs',
				loader: async ({ context }) => {
					// pre-fetch in SSR
					await context?.helpers.prompts.getPrompts.prefetch({});
					// pre-fetch in browser
					await routes.trpcUtils?.prompts.getPrompts.ensureData({}).catch(() => {});
					return null;
				},
				Component() {
					return <Jobs />;
				},
			},
			{
				path: '/dashboard/prompts/:promptId',
				loader: async ({ context, params }) => {
					const promptId = params.promptId;
					if (promptId) {
						// pre-fetch in SSR
						await context?.helpers.prompts.getPrompt.prefetch({ promptId });
						// pre-fetch in browser
						await routes.trpcUtils?.prompts.getPrompt.ensureData({ promptId }).catch(() => {});
					}
					return null;
				},
				Component() {
					return <Prompt />;
				},
			},
			{
				path: '/dashboard/prompts/:promptId/edit',
				Component() {
					return <EditPrompt />;
				},
			},
			{
				path: '/dashboard/prompts/create',
				Component() {
					return <CreatePrompt />;
				},
			},
			{
				path: '/dashboard/settings',
				Component() {
					return <Settings />;
				},
			},
			{
				path: '/dashboard/support',
				Component() {
					return <FullPageSupport />;
				},
			},
		],
	},
];

// browser-only context
export type RemixBrowserContext = {
	trpcUtils?: RouterUtils;
	queryClient?: QueryClient;
};

// server only context
export type RemixContext = {
	helpers: Helpers;
};

declare module 'react-router-dom' {
	interface LoaderFunctionArgs {
		context?: RemixContext;
	}

	interface ActionFunctionArgs {
		context?: RemixContext;
	}
}
