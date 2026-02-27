import request from '@/utils/request'
import type { Building } from '@/types/detection'

export const buildingApi = {
  // 获取建筑列表
  getBuildingList: (params?: any) => {
    return request.get<Building[]>('/buildings', { params } as any)
  },

  // 获取建筑详情
  getBuildingDetail: (id: number) => {
    return request.get<Building>(`/buildings/${id}`)
  },

  // 创建建筑
  createBuilding: (data: Partial<Building>) => {
    return request.post<Building>('/buildings', data)
  },

  // 更新建筑
  updateBuilding: (id: number, data: Partial<Building>) => {
    return request.put<Building>(`/buildings/${id}`, data)
  },

  // 删除建筑
  deleteBuilding: (id: number) => {
    return request.delete<void>(`/buildings/${id}`)
  }
}
