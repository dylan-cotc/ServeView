import axios, { AxiosInstance } from 'axios';
import pool from '../db';

const PC_API_BASE = 'https://api.planningcenteronline.com/services/v2';

export interface PCPlan {
  id: string;
  service_type_id?: string;
  attributes: {
    title: string;
    series_title: string;
    dates: string;
    sort_date: string;
  };
}

export interface PCTeamMember {
  id: string;
  attributes: {
    name: string;
    photo_thumbnail: string;
    team_position_name: string;
  };
  relationships: {
    person: {
      data: {
        id: string;
      };
    };
  };
}

export interface PCPerson {
  id: string;
  attributes: {
    first_name: string;
    last_name: string;
    photo_url: string;
  };
}

export interface PCItem {
  id: string;
  attributes: {
    title: string;
    sequence: number;
    item_type: string;
    key_name?: string;
  };
  relationships?: {
    arrangement?: {
      data?: {
        id: string;
      };
    };
  };
}

class PlanningCenterService {
  private client: AxiosInstance | null = null;

  async initialize(clientId?: string, clientSecret?: string): Promise<void> {
    // Use Personal Access Token credentials for authentication
    let pcClientId = clientId;
    let pcClientSecret = clientSecret;

    if (!pcClientId || !pcClientSecret) {
      const result = await pool.query(
        "SELECT key, value FROM settings WHERE key IN ('pc_client_id', 'pc_client_secret')"
      );

      const settings = result.rows.reduce((acc: any, row: any) => {
        acc[row.key] = row.value;
        return acc;
      }, {});

      pcClientId = settings.pc_client_id;
      pcClientSecret = settings.pc_client_secret;
    }

    if (!pcClientId || !pcClientSecret) {
      throw new Error('Planning Center Personal Access Token credentials not configured. Please configure Application ID and Secret in Settings.');
    }

    // Use Personal Access Token with basic auth (Application ID as username, Secret as password)
    this.client = axios.create({
      baseURL: PC_API_BASE,
      auth: {
        username: pcClientId,
        password: pcClientSecret,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }


  private ensureInitialized(): void {
    if (!this.client) {
      throw new Error('Planning Center service not initialized');
    }
  }

  // Get next upcoming plan for a specific service type
  async getNextPlan(serviceTypeId: string): Promise<PCPlan | null> {
    this.ensureInitialized();

    // Get plans for this service type
    const plansResponse = await this.client!.get(
      `/service_types/${serviceTypeId}/plans`,
      {
        params: {
          filter: 'future',
          order: 'sort_date',
          per_page: 1,
        },
      }
    );

    const plans = plansResponse.data.data;
    if (plans.length > 0) {
      const plan = plans[0];
      plan.service_type_id = serviceTypeId;
      return plan;
    }
    return null;
  }

  // Get team members for a specific plan
  async getPlanTeamMembers(planId: string, serviceTypeId?: string): Promise<PCTeamMember[]> {
    this.ensureInitialized();

    const url = serviceTypeId
      ? `/service_types/${serviceTypeId}/plans/${planId}/team_members`
      : `/plans/${planId}/team_members`;

    const response = await this.client!.get(url, {
      params: {
        include: 'person',
        per_page: 100,
      },
    });

    return response.data.data;
  }

  // Get person details
  async getPerson(personId: string): Promise<PCPerson> {
    this.ensureInitialized();

    const response = await this.client!.get(
      `https://api.planningcenteronline.com/people/v2/people/${personId}`
    );

    return response.data.data;
  }

  // Get plan items (setlist)
  async getPlanItems(planId: string, serviceTypeId?: string): Promise<PCItem[]> {
    this.ensureInitialized();

    const url = serviceTypeId
      ? `/service_types/${serviceTypeId}/plans/${planId}/items`
      : `/plans/${planId}/items`;

    const response = await this.client!.get(url, {
      params: {
        order: 'sequence',
        per_page: 100,
        include: 'arrangement',
      },
    });

    const items = response.data.data;
    const included = response.data.included || [];

    // Map arrangement data to items
    const arrangementsMap = new Map();
    included.forEach((item: any) => {
      if (item.type === 'Arrangement') {
        arrangementsMap.set(item.id, item.attributes);
      }
    });

    // Enrich items with arrangement key data
    items.forEach((item: PCItem) => {
      if (item.relationships?.arrangement?.data?.id) {
        const arrangementId = item.relationships.arrangement.data.id;
        const arrangement = arrangementsMap.get(arrangementId);
        if (arrangement && arrangement.bpm && arrangement.meter && arrangement.key_name) {
          item.attributes.key_name = arrangement.key_name;
        }
      }
    });

    return items;
  }

  // Get all positions/team positions for a specific service type
  async getAllPositions(serviceTypeId: string): Promise<any[]> {
    this.ensureInitialized();

    // Get team positions for this service type
    const response = await this.client!.get(
      `/service_types/${serviceTypeId}/team_positions`,
      {
        params: {
          per_page: 100,
        },
      }
    );

    return response.data.data;
  }

  // Get all service types (locations in Planning Center)
  async getAllServiceTypes(): Promise<any[]> {
    this.ensureInitialized();

    const response = await this.client!.get('/service_types', {
      params: {
        per_page: 100,
        include: 'folder',
      },
    });

    return response.data.data;
  }

  // Get all folders
  async getAllFolders(): Promise<any[]> {
    this.ensureInitialized();

    const response = await this.client!.get('/folders', {
      params: {
        per_page: 100,
      },
    });

    return response.data.data;
  }
}

export default new PlanningCenterService();
