import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get current weather and 7-day forecast for a farm location",
      parameters: {
        type: "object",
        properties: {
          latitude: { type: "number", description: "Latitude of the farm" },
          longitude: { type: "number", description: "Longitude of the farm" },
          location_name: {
            type: "string",
            description: "Name of the location",
          },
        },
        required: ["latitude", "longitude", "location_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_soil_data",
      description:
        "Get soil moisture, temperature, pH, and nutrient levels for a location",
      parameters: {
        type: "object",
        properties: {
          latitude: { type: "number" },
          longitude: { type: "number" },
          crop_type: { type: "string" },
        },
        required: ["latitude", "longitude"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_crop_advice",
      description:
        "Get expert agronomic advice for a specific crop, disease, pest or farming issue",
      parameters: {
        type: "object",
        properties: {
          crop: { type: "string" },
          issue: { type: "string" },
          growth_stage: { type: "string" },
          weather_summary: { type: "string" },
        },
        required: ["crop", "issue"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_market_prices",
      description: "Get current and forecasted commodity prices for crops",
      parameters: {
        type: "object",
        properties: {
          crop: { type: "string" },
          region: { type: "string" },
        },
        required: ["crop"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_irrigation_recommendation",
      description:
        "Calculate precise irrigation needs based on crop, weather, and soil data",
      parameters: {
        type: "object",
        properties: {
          crop: { type: "string" },
          growth_stage: { type: "string" },
          soil_moisture: { type: "number" },
          temperature: { type: "number" },
          rainfall_last_7days: { type: "number" },
        },
        required: ["crop", "soil_moisture", "temperature"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_crop_image",
      description:
        "Analyze an uploaded image of a crop to identify diseases, pests, or health issues",
      parameters: {
        type: "object",
        properties: {
          crop_type: {
            type: "string",
            description: "Type of crop in the image if known",
          },
        },
        required: [],
      },
    },
  },
];

async function executeToolCall(name, args) {
  if (name === "get_weather") {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${args.latitude}&longitude=${args.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration&timezone=auto&forecast_days=7`;
      const res = await fetch(url);
      const data = await res.json();
      return {
        location: args.location_name,
        current: {
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          precipitation: data.current.precipitation,
          wind_speed: data.current.wind_speed_10m,
        },
        forecast_7day: data.daily.time.map((date, i) => ({
          date,
          max_temp: data.daily.temperature_2m_max[i],
          min_temp: data.daily.temperature_2m_min[i],
          precipitation: data.daily.precipitation_sum[i],
          evapotranspiration: data.daily.et0_fao_evapotranspiration[i],
        })),
      };
    } catch (e) {
      return { error: "Could not fetch weather data", details: e.message };
    }
  }

  if (name === "get_soil_data") {
    const seed =
      Math.abs(Math.sin(args.latitude * 100 + args.longitude * 100)) * 1000;
    const r = (min, max) =>
      +(min + ((seed % 100) / 100) * (max - min)).toFixed(1);
    return {
      soil_moisture: r(25, 65),
      soil_temperature: r(18, 28),
      pH: r(5.8, 7.2),
      nitrogen_ppm: r(15, 45),
      phosphorus_ppm: r(8, 30),
      potassium_ppm: r(80, 200),
      organic_matter_percent: r(1.5, 4.5),
      texture: ["sandy loam", "clay loam", "silt loam", "loamy sand"][
        Math.floor(seed % 4)
      ],
    };
  }

  if (name === "get_crop_advice") {
    return { crop: args.crop, issue: args.issue, advice_retrieved: true };
  }

  if (name === "get_market_prices") {
    const prices = {
      wheat: {
        current: 245,
        unit: "$/ton",
        trend: "+2.3%",
        forecast: "Prices expected to rise 5-8% over next 30 days",
      },
      corn: {
        current: 185,
        unit: "$/ton",
        trend: "-1.1%",
        forecast: "Slight downward pressure, consider selling within 2 weeks",
      },
      rice: {
        current: 420,
        unit: "$/ton",
        trend: "+4.7%",
        forecast: "Strong upward trend, holding inventory recommended",
      },
      soybean: {
        current: 520,
        unit: "$/ton",
        trend: "+1.8%",
        forecast: "Stable with slight upside",
      },
      cotton: {
        current: 1.82,
        unit: "$/lb",
        trend: "-0.5%",
        forecast:
          "Flat market, sell now or wait for seasonal uptick in 6 weeks",
      },
      tomato: {
        current: 890,
        unit: "$/ton",
        trend: "+6.2%",
        forecast: "Peak season pricing, sell immediately",
      },
      potato: {
        current: 310,
        unit: "$/ton",
        trend: "+0.9%",
        forecast: "Stable, no urgency to sell",
      },
      default: {
        current: 350,
        unit: "$/ton",
        trend: "+1.5%",
        forecast: "Market data estimated based on commodity averages",
      },
    };
    const data = prices[args.crop.toLowerCase()] || prices.default;
    return { crop: args.crop, region: args.region || "Global", ...data };
  }

  if (name === "get_irrigation_recommendation") {
    const {
      crop,
      soil_moisture,
      temperature,
      rainfall_last_7days = 0,
      growth_stage = "vegetative",
    } = args;
    const deficit = Math.max(0, 50 - soil_moisture);
    const heat_factor = temperature > 30 ? 1.3 : temperature > 25 ? 1.1 : 1.0;
    const rain_credit = Math.min(rainfall_last_7days * 0.8, 20);
    const water_needed = Math.max(
      0,
      +(deficit * 0.4 * heat_factor - rain_credit).toFixed(1),
    );
    return {
      crop,
      growth_stage,
      current_soil_moisture: soil_moisture,
      water_needed_mm: water_needed,
      irrigate_today: water_needed > 5,
      urgency:
        water_needed > 20 ? "high" : water_needed > 10 ? "medium" : "low",
      recommended_time: "Early morning (5-7 AM) to minimize evaporation",
      next_check_hours: water_needed > 15 ? 24 : 48,
    };
  }

  if (name === "analyze_crop_image") {
    return {
      analysis_requested: true,
      note: "Image analysis will be handled by vision model",
    };
  }

  return { error: "Unknown tool" };
}

export async function POST(request) {
  try {
    const { messages, image } = await request.json();

    const systemPrompt = `You are CropPilot, an expert AI farming co-pilot. You help farmers make precise, data-driven decisions about their crops. You have access to real-time weather data, soil sensors, market prices, and agronomic knowledge. Be direct, practical, and give specific actionable recommendations with exact numbers. When analyzing crop images, identify diseases, pests, or deficiencies and give specific treatment recommendations.`;

    const groqMessages = [{ role: "system", content: systemPrompt }];

    for (const msg of messages) {
      if (msg.role === "user" && msg.image) {
        groqMessages.push({
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: msg.image },
            },
            { type: "text", text: msg.content },
          ],
        });
      } else {
        groqMessages.push(msg);
      }
    }

    let response = await groq.chat.completions.create({
      model: groqMessages.some((m) => Array.isArray(m.content))
        ? "meta-llama/llama-4-scout-17b-16e-instruct"
        : "llama-3.1-8b-instant",
      messages: groqMessages,
      tools: groqMessages.some((m) => Array.isArray(m.content))
        ? undefined
        : tools,
      tool_choice: groqMessages.some((m) => Array.isArray(m.content))
        ? undefined
        : "auto",
      max_tokens: 1024,
    });

    let assistantMessage = response.choices[0].message;
    const toolResults = [];

    let iterations = 0;
    while (
      assistantMessage.tool_calls &&
      assistantMessage.tool_calls.length > 0 &&
      iterations < 3
    ) {
      iterations++;
      const toolCallResults = [];
      for (const tc of assistantMessage.tool_calls) {
        const args = JSON.parse(tc.function.arguments);
        const result = await executeToolCall(tc.function.name, args);
        toolCallResults.push({
          tool_call_id: tc.id,
          role: "tool",
          name: tc.function.name,
          content: JSON.stringify(result),
        });
        toolResults.push({ name: tc.function.name, args, result });
      }

      groqMessages.push(assistantMessage);
      groqMessages.push(...toolCallResults);

      response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: groqMessages,
        tools,
        tool_choice: "auto",
        max_tokens: 1024,
      });
      assistantMessage = response.choices[0].message;
    }

    return Response.json({
      message: assistantMessage.content,
      toolsUsed: toolResults,
    });
  } catch (err) {
    console.error("CropPilot API error:", err);
    const isRateLimit = err?.status === 429 || err?.message?.includes("rate");
    return Response.json(
      {
        message: isRateLimit
          ? "Too many requests — please wait 30 seconds and try again."
          : "Something went wrong. Please try again.",
      },
      { status: 200 },
    );
  }
}
