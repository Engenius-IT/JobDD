'use client';

import { useState, useEffect, useMemo } from 'react';
import { SearchableSelect } from './SearchableSelect';

export interface SubDistrictItem {
  id: number;
  zip_code: number;
  name_th: string;
  name_en: string;
  district_id: number;
}

export interface DistrictItem {
  id: number;
  name_th: string;
  name_en: string;
  province_id: number;
  sub_districts: SubDistrictItem[];
}

export interface ProvinceItem {
  id: number;
  name_th: string;
  name_en: string;
  districts: DistrictItem[];
}

interface ThaiAddressFieldsProps {
  locale: 'th' | 'en';
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
  onChange: (fields: {
    province: string;
    district: string;
    subDistrict: string;
    postalCode: string;
  }) => void;
}

const DATA_URL =
  'https://cdn.jsdelivr.net/gh/kongvut/thai-province-data@master/api/latest/province_with_district_and_sub_district.json';

// In-memory cache across component mounts so the data is only fetched once per session
let cachedData: ProvinceItem[] | null = null;
let fetchPromise: Promise<ProvinceItem[]> | null = null;

// 1. ดิกชันนารีแปลชื่อจังหวัด 77 จังหวัด สำหรับการแสดงผลทันทีระหว่างรอโหลด
const PROVINCE_EN_MAP: Record<string, string> = {
  'กรุงเทพมหานคร': 'Bangkok', 'กระบี่': 'Krabi', 'กาญจนบุรี': 'Kanchanaburi',
  'กาฬสินธุ์': 'Kalasin', 'กำแพงเพชร': 'Kamphaeng Phet', 'ขอนแก่น': 'Khon Kaen',
  'จันทบุรี': 'Chanthaburi', 'ฉะเชิงเทรา': 'Chachoengsao', 'ชลบุรี': 'Chonburi',
  'ชัยนาท': 'Chainat', 'ชัยภูมิ': 'Chaiyaphum', 'ชุมพร': 'Chumphon',
  'เชียงราย': 'Chiang Rai', 'เชียงใหม่': 'Chiang Mai', 'ตรัง': 'Trang',
  'ตราด': 'Trat', 'ตาก': 'Tak', 'นครนายก': 'Nakhon Nayok',
  'นครปฐม': 'Nakhon Pathom', 'นครพนม': 'Nakhon Phanom', 'นครราชสีมา': 'Nakhon Ratchasima',
  'นครศรีธรรมราช': 'Nakhon Si Thammarat', 'นครสวรรค์': 'Nakhon Sawan', 'นนทบุรี': 'Nonthaburi',
  'นราธิวาส': 'Narathiwat', 'น่าน': 'Nan', 'บึงกาฬ': 'Bueng Kan',
  'บุรีรัมย์': 'Buri Ram', 'ปทุมธานี': 'Pathum Thani', 'ประจวบคีรีขันธ์': 'Prachuap Khiri Khan',
  'ปราจีนบุรี': 'Prachin Buri', 'ปัตตานี': 'Pattani', 'พระนครศรีอยุธยา': 'Phra Nakhon Si Ayutthaya',
  'พะเยา': 'Phayao', 'พังงา': 'Phang Nga', 'พัทลุง': 'Phatthalung',
  'พิจิตร': 'Phichit', 'พิษณุโลก': 'Phitsanulok', 'เพชรบุรี': 'Phetchaburi',
  'เพชรบูรณ์': 'Phetchabun', 'แพร่': 'Phrae', 'ภูเก็ต': 'Phuket',
  'มหาสารคาม': 'Maha Sarakham', 'มุกดาหาร': 'Mukdahan', 'แม่ฮ่องสอน': 'Mae Hong Son',
  'ยโสธร': 'Yasothon', 'ยะลา': 'Yala', 'ร้อยเอ็ด': 'Roi Et',
  'ระนอง': 'Ranong', 'ระยอง': 'Rayong', 'ราชบุรี': 'Ratchaburi',
  'ลพบุรี': 'Lopburi', 'ลำปาง': 'Lampang', 'ลำพูน': 'Lamphun', 'เลย': 'Loei',
  'ศรีสะเกษ': 'Si Sa Ket', 'สกลนคร': 'Sakon Nakhon', 'สงขลา': 'Songkhla',
  'สตูล': 'Satun', 'สมุทรปราการ': 'Samut Prakan',
  'สมุทรสงคราม': 'Samut Songkhram', 'สมุทรสาคร': 'Samut Sakhon', 'สระแก้ว': 'Sa Kaeo',
  'สระบุรี': 'Saraburi', 'สิงห์บุรี': 'Sing Buri', 'สุโขทัย': 'Sukhothai',
  'สุพรรณบุรี': 'Suphan Buri', 'สุราษฎร์ธานี': 'Surat Thani', 'สุรินทร์': 'Surin',
  'หนองคาย': 'Nong Khai', 'หนองบัวลำภู': 'Nong Bua Lamphu', 'อ่างทอง': 'Ang Thong',
  'อำนาจเจริญ': 'Amnat Charoen', 'อุดรธานี': 'Udon Thani', 'อุตรดิตถ์': 'Uttaradit',
  'อุทัยธานี': 'Uthai Thani', 'อุบลราชธานี': 'Ubon Ratchathani'
};

// Helper ฟังก์ชันสำหรับลบคำนำหน้า (อำเภอ, เขต, khet, amphoe) เพื่อให้ค้นหาตรงกันได้อย่างแม่นยำ
const cleanDistrictName = (s: string) => {
  if (!s) return '';
  return s
    .replace(/^(อำเภอ|เขต|khet\s+|amphoe\s+|district\s+)/i, '')
    .trim()
    .toLowerCase();
};

// Helper ฟังก์ชันสำหรับลบคำนำหน้า (ตำบล, แขวง, tambon, khwaeng)
const cleanSubDistrictName = (s: string) => {
  if (!s) return '';
  return s
    .replace(/^(ตำบล|แขวง|tambon\s+|khwaeng\s+|sub-district\s+)/i, '')
    .trim()
    .toLowerCase();
};

export function ThaiAddressFields({
  locale,
  province,
  district,
  subDistrict,
  postalCode,
  onChange,
}: ThaiAddressFieldsProps) {
  const [data, setData] = useState<ProvinceItem[]>(() => cachedData || []);
  const [loading, setLoading] = useState<boolean>(!cachedData);

  useEffect(() => {
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetch(DATA_URL)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
          return r.json();
        })
        .then((json: ProvinceItem[]) => {
          cachedData = json;
          return json;
        })
        .catch((err) => {
          console.error('Failed to load official Thai address data:', err);
          fetchPromise = null;
          return [];
        });
    }

    fetchPromise.then((json) => {
      setData(json);
      setLoading(false);
    });
  }, []);

  // 1. ค้นหาจังหวัดที่ถูกเลือก
  const selectedProvince = useMemo(() => {
    if (!province) return null;
    const provLower = province.trim().toLowerCase();
    return (
      data.find(
        (p) =>
          p.name_th === province ||
          p.name_en.toLowerCase() === provLower ||
          PROVINCE_EN_MAP[p.name_th]?.toLowerCase() === provLower
      ) || null
    );
  }, [data, province]);

  // 2. ค้นหาอำเภอ / เขตที่ถูกเลือก
  const selectedDistrict = useMemo(() => {
    if (!district || !selectedProvince) return null;
    const distLower = district.trim().toLowerCase();
    const cleanD = cleanDistrictName(district);

    return (
      selectedProvince.districts.find(
        (d) =>
          d.name_th === district ||
          d.name_en.toLowerCase() === distLower ||
          cleanDistrictName(d.name_th) === cleanD ||
          cleanDistrictName(d.name_en) === cleanD
      ) || null
    );
  }, [selectedProvince, district]);

  // 3. ค้นหาตำบล / แขวงที่ถูกเลือก
  const selectedSubDistrict = useMemo(() => {
    if (!subDistrict || !selectedDistrict) return null;
    const subLower = subDistrict.trim().toLowerCase();
    const cleanS = cleanSubDistrictName(subDistrict);

    return (
      selectedDistrict.sub_districts.find(
        (s) =>
          s.name_th === subDistrict ||
          s.name_en.toLowerCase() === subLower ||
          cleanSubDistrictName(s.name_th) === cleanS ||
          cleanSubDistrictName(s.name_en) === cleanS
      ) || null
    );
  }, [selectedDistrict, subDistrict]);

  // ตัวเลือกจังหวัด (เรียงลำดับ ก-ฮ ภาษาไทยคงที่ทั้งโหมดไทยและอังกฤษ เพื่อไม่ให้ลำดับกระโดด)
  const provinceOptions = useMemo(() => {
    return data
      .map((p) => ({
        value: p.name_th,
        label: locale === 'en' ? (p.name_en || PROVINCE_EN_MAP[p.name_th] || p.name_th) : p.name_th,
      }))
      .sort((a, b) => a.value.localeCompare(b.value, 'th'));
  }, [data, locale]);

  // ตัวเลือกอำเภอ / เขต (เรียงลำดับ ก-ฮ ภาษาไทยคงที่ทั้งโหมดไทยและอังกฤษ)
  const districtOptions = useMemo(() => {
    if (!selectedProvince) return [];
    return selectedProvince.districts
      .map((d) => ({
        value: d.name_th,
        label: locale === 'en' ? d.name_en : d.name_th,
      }))
      .sort((a, b) => a.value.localeCompare(b.value, 'th'));
  }, [selectedProvince, locale]);

  // ตัวเลือกตำบล / แขวง (เรียงลำดับ ก-ฮ ภาษาไทยคงที่ทั้งโหมดไทยและอังกฤษ)
  const subDistrictOptions = useMemo(() => {
    if (!selectedDistrict) return [];
    return selectedDistrict.sub_districts
      .map((s) => ({
        value: s.name_th,
        label: locale === 'en' ? s.name_en : s.name_th,
      }))
      .sort((a, b) => a.value.localeCompare(b.value, 'th'));
  }, [selectedDistrict, locale]);

  const isBangkok =
    selectedProvince?.name_th === 'กรุงเทพมหานคร' ||
    province === 'กรุงเทพมหานคร' ||
    province.toLowerCase() === 'bangkok';

  const t = {
    province: locale === 'en' ? 'Province' : 'จังหวัด',
    district: locale === 'en' ? 'District' : isBangkok ? 'เขต' : 'อำเภอ',
    subDistrict: locale === 'en' ? 'Sub-district' : isBangkok ? 'แขวง' : 'ตำบล',
    postalCode: locale === 'en' ? 'Postal Code' : 'รหัสไปรษณีย์',
    load: locale === 'en' ? 'Loading...' : 'กำลังโหลด...',
    searchProvince: locale === 'en' ? 'Select Province' : 'เลือกจังหวัด',
    searchDistrict: locale === 'en' ? 'Select District' : isBangkok ? 'เลือกเขต' : 'เลือกอำเภอ',
    searchSubDistrict: locale === 'en' ? 'Select Sub-district' : isBangkok ? 'เลือกแขวง' : 'เลือกตำบล',
    selectProvinceFirst: locale === 'en' ? 'Please select province first' : 'กรุณาเลือกจังหวัดก่อน',
    selectDistrictFirst:
      locale === 'en'
        ? 'Please select district first'
        : isBangkok
        ? 'กรุณาเลือกเขตก่อน'
        : 'กรุณาเลือกอำเภอก่อน',
  };

  const handleProvince = (val: string) => {
    const matched = data.find(
      (p) =>
        p.name_th === val ||
        p.name_en.toLowerCase() === val.trim().toLowerCase()
    );
    const provNameTh = matched ? matched.name_th : val;
    onChange({
      province: provNameTh,
      district: '',
      subDistrict: '',
      postalCode: '',
    });
  };

  const handleDistrict = (val: string) => {
    const matched = selectedProvince?.districts.find(
      (d) =>
        d.name_th === val ||
        d.name_en.toLowerCase() === val.trim().toLowerCase() ||
        cleanDistrictName(d.name_th) === cleanDistrictName(val)
    );
    const distNameTh = matched ? matched.name_th : val;
    onChange({
      province: selectedProvince ? selectedProvince.name_th : province,
      district: distNameTh,
      subDistrict: '',
      postalCode: '',
    });
  };

  const handleSubDistrict = (val: string) => {
    const matched = selectedDistrict?.sub_districts.find(
      (s) =>
        s.name_th === val ||
        s.name_en.toLowerCase() === val.trim().toLowerCase() ||
        cleanSubDistrictName(s.name_th) === cleanSubDistrictName(val)
    );
    const subNameTh = matched ? matched.name_th : val;
    onChange({
      province: selectedProvince ? selectedProvince.name_th : province,
      district: selectedDistrict ? selectedDistrict.name_th : district,
      subDistrict: subNameTh,
      postalCode: matched?.zip_code ? String(matched.zip_code) : postalCode,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* จังหวัด (Province) */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{t.province}</label>
        <SearchableSelect
          locale={locale}
          placeholder={loading ? t.load : t.searchProvince}
          value={selectedProvince ? selectedProvince.name_th : province}
          onChange={handleProvince}
          options={provinceOptions}
        />
      </div>

      {/* อำเภอ / เขต (District) */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{t.district}</label>
        <SearchableSelect
          locale={locale}
          placeholder={!province ? t.selectProvinceFirst : t.searchDistrict}
          value={selectedDistrict ? selectedDistrict.name_th : district}
          onChange={handleDistrict}
          options={districtOptions}
        />
      </div>

      {/* ตำบล / แขวง (Sub-district) */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{t.subDistrict}</label>
        <SearchableSelect
          locale={locale}
          placeholder={!district ? t.selectDistrictFirst : t.searchSubDistrict}
          value={selectedSubDistrict ? selectedSubDistrict.name_th : subDistrict}
          onChange={handleSubDistrict}
          options={subDistrictOptions}
        />
      </div>

      {/* รหัสไปรษณีย์ (Postal Code) */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{t.postalCode}</label>
        <input
          type="text"
          disabled
          value={postalCode}
          className="w-full bg-gray-100 border border-gray-300 text-gray-700 py-2.5 px-3 rounded-lg focus:outline-none cursor-not-allowed"
        />
      </div>
    </div>
  );
}