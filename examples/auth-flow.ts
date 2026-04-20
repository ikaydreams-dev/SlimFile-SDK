/**
 * Auth flow example — create an account and generate an API key programmatically.
 *
 * Use this when your application needs to manage SlimFile credentials on behalf of a user,
 * or when you want to automate the onboarding flow without visiting the dashboard.
 *
 * After running this once, copy the printed API key into your .env file.
 */

import { SlimFileClient } from '../src/index.js'

// No API key yet — we are about to create one
const client = new SlimFileClient()

// Sign up for a new account (use client.login() if you already have one)
const { user } = await client.signup('Jane Dev', 'jane@example.com', 'your-password')
console.log(`Account created for ${user.name}`)

// Generate an API key — the client auto-configures itself with it
const { apiKey } = await client.createApiKey('my-app')

console.log('\nAdd this to your .env file:')
console.log(`SLIMFILE_API_KEY=${apiKey}`)
console.log('\nYou can now compress files immediately:')

// The client is already configured — no need to reinstantiate
const result = await client.compress('./photo.jpg')
console.log(`Compressed photo.jpg — ${result.compressionRatio}% smaller`)
