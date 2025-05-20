
export interface StationData {
  id: string;
  name: string;
  position: [number, number, number]; // Vị trí 3D [x, y, z]
  color: string; // Màu sắc cho ga
  details?: string; // Thông tin thêm cho tooltip
}

export const HO_CHI_MINH_METRO_LINE_1_STATIONS: StationData[] = [
  { id: 'SG01', name: 'Bến Thành', position: [0, 0, 0], color: '#0EA5E9', details: 'Ga trung tâm' },
  { id: 'SG02', name: 'Nhà hát Thành phố', position: [10, 0, 0], color: '#0EA5E9', details: 'Gần Nhà hát Lớn' },
  { id: 'SG03', name: 'Ba Son', position: [20, 0, 0], color: '#0EA5E9', details: 'Khu vực Ba Son cũ' },
  { id: 'SG04', name: 'Công viên Văn Thánh', position: [30, 0, 0], color: '#84CC16', details: 'Gần KDL Văn Thánh' },
  { id: 'SG05', name: 'Tân Cảng', position: [40, 0, 0], color: '#84CC16', details: 'Khu vực Tân Cảng' },
  { id: 'SG06', name: 'Thảo Điền', position: [50, 0, 0], color: '#84CC16', details: 'Khu dân cư Thảo Điền' },
  { id: 'SG07', name: 'An Phú', position: [60, 0, 0], color: '#84CC16', details: 'Khu dân cư An Phú' },
  { id: 'SG08', name: 'Rạch Chiếc', position: [70, 0, 0], color: '#EAB308', details: 'Gần cầu Rạch Chiếc' },
  { id: 'SG09', name: 'Phước Long', position: [80, 0, 0], color: '#EAB308', details: 'Phường Phước Long' },
  { id: 'SG10', name: 'Bình Thái', position: [90, 0, 0], color: '#EAB308', details: 'Ngã tư Bình Thái' },
  { id: 'SG11', name: 'Thủ Đức', position: [100, 0, 0], color: '#F97316', details: 'Trung tâm Thủ Đức' },
  { id: 'SG12', name: 'Khu Công nghệ cao', position: [110, 0, 0], color: '#F97316', details: 'Cổng vào Khu CNC' },
  { id: 'SG13', name: 'Đại học Quốc gia', position: [120, 0, 0], color: '#EF4444', details: 'Làng Đại học' },
  { id: 'SG14', name: 'Bến xe Suối Tiên', position: [130, 0, 0], color: '#EF4444', details: 'Gần KDL Suối Tiên' },
];

export const STATION_DISTANCE = 10; // Khoảng cách giữa các ga trên trục X
export const STATION_RADIUS = 0.5; // Bán kính của ga (hình trụ/cầu)
export const TRACK_RADIUS = 0.1; // Bán kính của đường ray

