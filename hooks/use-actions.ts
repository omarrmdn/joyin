import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export function useActions() {
  const { user } = useAuth();

  /**
   * Records a user action in the database
   */
  const logAction = async (data: {
    action_type: string;
    entity_type?: string;
    entity_id?: string;
    metadata?: Record<string, any>;
  }) => {
    if (!user) return;

    const { error } = await supabase.from("actions").insert({
      user_id: user.id,
      action_type: data.action_type,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      metadata: data.metadata || {},
      platform: "web"
    });

    if (error) {
      console.error("Error logging action:", error);
    }
  };

  /**
   * Fetches the history of actions for the current user
   */
  const getActions = async (limit = 50) => {
    if (!user) return [];

    const { data, error } = await supabase
      .from("actions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching actions:", error);
      return [];
    }
    return data;
  };

  return { logAction, getActions };
}
