import "dotenv/config";
import { supabase } from "../libs/supabase.js";

const testConnection = async () => {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .limit(3);

  if (error) {
    console.error("Error conectando con Supabase:", error);
    return;
  }

  console.log("Conexión correcta ✅");
  console.log(data);
};

testConnection();