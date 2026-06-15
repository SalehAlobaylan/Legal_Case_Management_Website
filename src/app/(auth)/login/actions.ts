"use server";

export async function verifyDemoPin(pin: string) {
  // Use private environment variables (no NEXT_PUBLIC_ prefix) so they are NEVER sent to the browser
  const expectedPin = process.env.DEMO_PIN || "202626";
  
  if (pin === expectedPin) {
    // Only return the credentials if the PIN matches
    return {
      success: true,
      email: process.env.DEMO_EMAIL || "ahmed@alfaisal-law.sa",
      password: process.env.DEMO_PASSWORD || "password123"
    };
  }
  
  return { success: false };
}
