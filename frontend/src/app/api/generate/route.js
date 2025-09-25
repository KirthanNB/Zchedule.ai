// frontend/src/app/api/generate/route.js
export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    
    const res = await fetch(`${backendUrl}/generate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        user_id: body.user_id,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Backend error" }));
      return new Response(
        JSON.stringify({ 
          error: errorData.error || "Failed to generate schedule",
          details: errorData
        }), 
        { status: res.status }
      );
    }

    const schedule = await res.json();
    return new Response(JSON.stringify(schedule), { status: 200 });
    
  } catch (error) {
    console.error("Frontend API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500 }
    );
  }
}
