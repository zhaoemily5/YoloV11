package com.taoxichuan.controller;

import com.taoxichuan.common.result.Result;
import com.taoxichuan.dto.building.BuildingDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 建筑管理控制器
 */
@RestController
@RequestMapping("/buildings")
@Tag(name = "建筑管理", description = "建筑信息相关接口")
@Slf4j
public class BuildingController {

    // 模拟建筑数据
    private static final List<BuildingDTO> BUILDING_LIST = new ArrayList<>();
    
    static {
        // 初始化陶溪川建筑数据
        BuildingDTO building1 = new BuildingDTO();
        building1.setId(1L);
        building1.setBuildingCode("TXC-001");
        building1.setBuildingName("东门窑房");
        building1.setBuildingType("工业厂房");
        building1.setAddress("陶溪川文创街区东侧");
        building1.setBuildYear(1958);
        building1.setArea(2500.0);
        building1.setStructureType("砖混结构");
        building1.setStatus(0);
        building1.setCreatedTime(LocalDateTime.now());
        building1.setUpdatedTime(LocalDateTime.now());
        BUILDING_LIST.add(building1);
        
        BuildingDTO building2 = new BuildingDTO();
        building2.setId(2L);
        building2.setBuildingCode("TXC-002");
        building2.setBuildingName("西侧老厂房");
        building2.setBuildingType("工业厂房");
        building2.setAddress("陶溪川文创街区西侧");
        building2.setBuildYear(1962);
        building2.setArea(3200.0);
        building2.setStructureType("砖木结构");
        building2.setStatus(1);
        building2.setCreatedTime(LocalDateTime.now());
        building2.setUpdatedTime(LocalDateTime.now());
        BUILDING_LIST.add(building2);
        
        BuildingDTO building3 = new BuildingDTO();
        building3.setId(3L);
        building3.setBuildingCode("TXC-003");
        building3.setBuildingName("中央展厅");
        building3.setBuildingType("展览建筑");
        building3.setAddress("陶溪川文创街区中心");
        building3.setBuildYear(1970);
        building3.setArea(1800.0);
        building3.setStructureType("框架结构");
        building3.setStatus(2);
        building3.setCreatedTime(LocalDateTime.now());
        building3.setUpdatedTime(LocalDateTime.now());
        BUILDING_LIST.add(building3);
        
        BuildingDTO building4 = new BuildingDTO();
        building4.setId(4L);
        building4.setBuildingCode("TXC-004");
        building4.setBuildingName("北侧仓库");
        building4.setBuildingType("仓储建筑");
        building4.setAddress("陶溪川文创街区北侧");
        building4.setBuildYear(1965);
        building4.setArea(1500.0);
        building4.setStructureType("砖混结构");
        building4.setStatus(0);
        building4.setCreatedTime(LocalDateTime.now());
        building4.setUpdatedTime(LocalDateTime.now());
        BUILDING_LIST.add(building4);
        
        BuildingDTO building5 = new BuildingDTO();
        building5.setId(5L);
        building5.setBuildingCode("TXC-005");
        building5.setBuildingName("南门办公楼");
        building5.setBuildingType("办公建筑");
        building5.setAddress("陶溪川文创街区南侧");
        building5.setBuildYear(1975);
        building5.setArea(1200.0);
        building5.setStructureType("砖混结构");
        building5.setStatus(0);
        building5.setCreatedTime(LocalDateTime.now());
        building5.setUpdatedTime(LocalDateTime.now());
        BUILDING_LIST.add(building5);
        
        BuildingDTO building6 = new BuildingDTO();
        building6.setId(6L);
        building6.setBuildingCode("TXC-006");
        building6.setBuildingName("陶瓷艺术馆");
        building6.setBuildingType("展览建筑");
        building6.setAddress("陶溪川文创街区核心区");
        building6.setBuildYear(2015);
        building6.setArea(2800.0);
        building6.setStructureType("钢结构");
        building6.setStatus(1);
        building6.setCreatedTime(LocalDateTime.now());
        building6.setUpdatedTime(LocalDateTime.now());
        BUILDING_LIST.add(building6);
        
        BuildingDTO building7 = new BuildingDTO();
        building7.setId(7L);
        building7.setBuildingCode("TXC-007");
        building7.setBuildingName("传统制陶工坊");
        building7.setBuildingType("工业厂房");
        building7.setAddress("陶溪川文创街区西北角");
        building7.setBuildYear(1952);
        building7.setArea(2100.0);
        building7.setStructureType("土木结构");
        building7.setStatus(2);
        building7.setCreatedTime(LocalDateTime.now());
        building7.setUpdatedTime(LocalDateTime.now());
        BUILDING_LIST.add(building7);
        
        BuildingDTO building8 = new BuildingDTO();
        building8.setId(8L);
        building8.setBuildingCode("TXC-008");
        building8.setBuildingName("文创市集");
        building8.setBuildingType("商业建筑");
        building8.setAddress("陶溪川文创街区中心广场");
        building8.setBuildYear(2018);
        building8.setArea(3500.0);
        building8.setStructureType("框架结构");
        building8.setStatus(0);
        building8.setCreatedTime(LocalDateTime.now());
        building8.setUpdatedTime(LocalDateTime.now());
        BUILDING_LIST.add(building8);
    }

    @GetMapping
    @Operation(summary = "获取建筑列表", description = "获取所有建筑信息列表")
    public Result<List<BuildingDTO>> getBuildingList() {
        log.info("获取建筑列表, 共{}条记录", BUILDING_LIST.size());
        return Result.success("查询成功", BUILDING_LIST);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取建筑详情", description = "根据ID获取建筑详细信息")
    public Result<BuildingDTO> getBuildingDetail(@PathVariable Long id) {
        log.info("获取建筑详情: id={}", id);
        BuildingDTO building = BUILDING_LIST.stream()
                .filter(b -> b.getId().equals(id))
                .findFirst()
                .orElse(null);
        
        if (building == null) {
            return Result.error(404, "建筑不存在");
        }
        
        return Result.success("查询成功", building);
    }

    @PostMapping
    @Operation(summary = "创建建筑", description = "添加新的建筑信息")
    public Result<BuildingDTO> createBuilding(@RequestBody BuildingDTO buildingDTO) {
        log.info("创建建筑: {}", buildingDTO.getBuildingName());
        buildingDTO.setId((long) (BUILDING_LIST.size() + 1));
        buildingDTO.setCreatedTime(LocalDateTime.now());
        buildingDTO.setUpdatedTime(LocalDateTime.now());
        BUILDING_LIST.add(buildingDTO);
        return Result.success("创建成功", buildingDTO);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新建筑", description = "更新建筑信息")
    public Result<BuildingDTO> updateBuilding(@PathVariable Long id, @RequestBody BuildingDTO buildingDTO) {
        log.info("更新建筑: id={}", id);
        BuildingDTO existing = BUILDING_LIST.stream()
                .filter(b -> b.getId().equals(id))
                .findFirst()
                .orElse(null);
        
        if (existing == null) {
            return Result.error(404, "建筑不存在");
        }
        
        existing.setBuildingName(buildingDTO.getBuildingName());
        existing.setBuildingType(buildingDTO.getBuildingType());
        existing.setAddress(buildingDTO.getAddress());
        existing.setBuildYear(buildingDTO.getBuildYear());
        existing.setArea(buildingDTO.getArea());
        existing.setStructureType(buildingDTO.getStructureType());
        existing.setStatus(buildingDTO.getStatus());
        existing.setUpdatedTime(LocalDateTime.now());
        
        return Result.success("更新成功", existing);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除建筑", description = "删除指定建筑")
    public Result<Void> deleteBuilding(@PathVariable Long id) {
        log.info("删除建筑: id={}", id);
        BUILDING_LIST.removeIf(b -> b.getId().equals(id));
        return Result.success("删除成功", null);
    }
}
