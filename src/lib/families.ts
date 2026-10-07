export type Flat = {
  code: string;
  tower: number;
  floor: number;
  house: number;
};

export type Family = {
  id: string;
  name: string;
  flats: Flat[];
  note?: string;
};

export function flat(code: string): Flat {
  if (!/^[1-5]\d{3}$/.test(code)) {
    throw new Error(`Bad flat ${code}`);
  }
  return {
    code,
    tower: Number(code[0]),
    floor: Number(code.slice(1, 3)),
    house: Number(code[3]),
  };
}

/** One row per family that opted in at ₹2,100. Ids match the sangh list. */
export const FAMILIES: Family[] = [
  { id: "1", name: "Bipin Bafna", flats: [flat("3122")] },
  { id: "2", name: "Nitesh Golecha", flats: [flat("3103")] },
  { id: "3", name: "Naresh Kumar Jain", flats: [flat("1283")] },
  { id: "4", name: "Vikas Kapilbhai Mehta", flats: [flat("4101")] },
  { id: "5", name: "Kailash Popatlalji", flats: [flat("2202")] },
  { id: "6", name: "Goutam Punmiya", flats: [flat("2111")] },
  { id: "7", name: "Mahesh Panachandji Rathod", flats: [flat("1051")] },
  { id: "8", name: "Vishal Singhvi", flats: [flat("2061")] },
  { id: "9", name: "Akshay Mehta", flats: [flat("2106")] },
  { id: "10", name: "Jayendra Bhai", flats: [flat("3143")] },
  { id: "11", name: "Gowtham Surya Siyal", flats: [flat("1031")] },
  { id: "12", name: "Vinod Khoobilalji Ranka", flats: [flat("1092")] },
  { id: "13", name: "Kishore Benani", flats: [flat("4212")] },
  { id: "14", name: "Mamta Mutha", flats: [flat("2142")] },
  { id: "15", name: "Vasanth Kumar Mohanlalji", flats: [flat("2171")] },
  { id: "16", name: "Amit Ramesh Kumar", flats: [flat("2084")] },
  { id: "17", name: "Rakesh Chuttar", flats: [flat("5053")] },
  { id: "18", name: "Abhishek Shantilalji Mehta", flats: [flat("2192")] },
  { id: "19", name: "Hemraj Mukesh Kumar Kothari", flats: [flat("2054")] },
  { id: "20", name: "Sarla Devi Marlecha", flats: [flat("2154")] },
  { id: "21", name: "Narendra Yash Singhvi", flats: [flat("2153")] },
  { id: "22", name: "Kiran Jain", flats: [flat("2041")] },
  { id: "23", name: "Pinky Kiran Jain", flats: [flat("2041")] },
  { id: "24", name: "Ashok Kothari", flats: [flat("2134")] },
  { id: "25", name: "Mahaveer Chand Sripal Mehta", flats: [flat("1091")] },
  { id: "26", name: "Labhuban Kanak Rai Ajmera", flats: [flat("1141")] },
  { id: "27", name: "Mahendra Kumar Chowdhary", flats: [flat("2121")] },
  { id: "28", name: "Kantilal Chhajer", flats: [flat("2131"), flat("2132")] },
  { id: "29", name: "Misri Bai Sajjan Kothari", flats: [flat("4124")] },
  { id: "30", name: "Milapchand Jain", flats: [flat("1202")] },
  { id: "31", name: "Nithin Nahar", flats: [flat("2031")] },
  { id: "32", name: "Dilip Bohra", flats: [flat("1261")] },
  { id: "33", name: "Rajesh Kumar Parmar", flats: [flat("4184")] },
  { id: "34", name: "Lalith Parmar", flats: [flat("2124")] },
  { id: "35", name: "Nirav Sailesh Doshi", flats: [flat("2184")] },
  { id: "36", name: "Lalit Begani", flats: [flat("5156")] },
  { id: "37", name: "Poonam Paras Sanghvi", flats: [flat("1151")] },
  { id: "38", name: "Bharat H Shah", flats: [flat("1223")] },
  { id: "39", name: "Niraj Prakash Shah", flats: [flat("3205")] },
  { id: "40", name: "Amit Manharlal Parekh", flats: [flat("1131")] },
  { id: "41", name: "Vardhichand Rohitkumar Nahar", flats: [flat("1133")] },
  { id: "42", name: "Sonal Nishant Jain", flats: [flat("2115")] },
  { id: "43", name: "Amit Kumar", flats: [flat("1102")] },
  { id: "44", name: "Sushil Kumar Champalalji", flats: [flat("4226")] },
  { id: "45", name: "Champalalji", flats: [flat("3123")] },
  { id: "46", name: "Deepesh Khushboo Jain", flats: [flat("4183")] },
  { id: "47", name: "Khushal Nikita Pirgal", flats: [flat("4051")] },
  { id: "48", name: "Deepesh Priyanka Gadiya", flats: [flat("5075")] },
  { id: "49", name: "Nikita & Hema Singhvi", flats: [flat("2135")] },
  { id: "50", name: "Shilpi Kushal Shah", flats: [flat("4046")] },
  { id: "51", name: "Manish M Shah", flats: [flat("5142")] },
  { id: "52", name: "Sonu Niteshji", flats: [flat("2023")] },
  { id: "53", name: "Hetal Nilesh Dedhia", flats: [flat("5145")] },
  { id: "54", name: "Sureshji Suman Parmar", flats: [flat("5056")] },
  { id: "55", name: "Shruthi Jain", flats: [flat("1222")] },
  { id: "56", name: "Suryakant R Shah", flats: [flat("1052")] },
  { id: "57", name: "Raj Vinaya Jain", flats: [flat("4224")] },
  { id: "58", name: "Ashvin Laxmichand Semlani", flats: [flat("2094")] },
  { id: "59", name: "Meena Narendra Jain", flats: [flat("5175")] },
  { id: "60", name: "Ashish", flats: [flat("3155")] },
  { id: "61", name: "Deepak Kantilal Chandaliya", flats: [flat("5093")] },
  { id: "62", name: "Ravindra Bhai", flats: [flat("2196")] },
  { id: "63", name: "Sha Mishrimalji Ranawat and Sons", flats: [flat("1251"), flat("4182")] },
  { id: "64", name: "Ravi Agarwal", flats: [flat("2095")] },
  { id: "65", name: "Rohita R Shah", flats: [flat("4106")] },
  { id: "66", name: "Raksha B Shah", flats: [flat("4102")] },
  { id: "67", name: "Ashok Bhai Sahil", flats: [flat("2063")], note: "Laxmi Gold" },
  { id: "68", name: "Mahendra Bhai", flats: [flat("3043")] },
  { id: "69", name: "Naina Hitesh Punamiya", flats: [flat("5193")] },
  { id: "70", name: "Sushil Kantilal Surana", flats: [flat("2082")] },
  { id: "71", name: "Rahul Ramesh Kumar", flats: [flat("3045")] },
  { id: "72", name: "Ankush M Doshi", flats: [flat("1181")] },
  { id: "73", name: "Sunil Agarwal", flats: [flat("2144")] },
  { id: "74", name: "Indermal Hansrajji", flats: [flat("5185")] },
  { id: "75", name: "Rahul Kumar Shah", flats: [flat("2092")] },
  { id: "76", name: "Nikhil Jangada", flats: [flat("3192")] },
  { id: "77", name: "Pallavi Hitesh Savla", flats: [flat("1112")] },
  { id: "78", name: "Reena Hitesh Shah", flats: [flat("5146")] },
  { id: "79", name: "Heena Hitesh Sanghvi", flats: [flat("1282")] },
  { id: "80", name: "Vikas Sonika Chhajer", flats: [flat("1201")] },
  { id: "81", name: "Rajendra and Meena and Sons Desarla", flats: [flat("1252")] },
  { id: "82", name: "Vishal Shankla", flats: [flat("2206")] },
  { id: "83", name: "Kamlesh Bhawarlalji Karbawala", flats: [flat("1093")] },
  { id: "84", name: "Anand Bhawarlalji Karbawala", flats: [flat("1113")] },
  { id: "85", name: "Vijay Kumar Bafna", flats: [flat("5133")] },
  { id: "86", name: "Vasudev Agarwal", flats: [flat("1121")] },
  { id: "87", name: "Amit Jain", flats: [flat("2104")] },
  { id: "88", name: "Srinivas Sir", flats: [], note: "Income Tax" },
  { id: "89", name: "Rupali Punith Pruthy", flats: [flat("2051")] },
  { id: "90", name: "Anita Devendra Shah", flats: [flat("1182")] },
  { id: "91", name: "Shobhana D Shah", flats: [flat("3053")] },
  { id: "92", name: "Narendra Amit Singhvi", flats: [flat("5183")] },
  { id: "93", name: "Ruchi Sourabh Jain", flats: [flat("5112")] },
  { id: "94", name: "Ramesh Patira", flats: [flat("1212")] },
  { id: "95", name: "Kailash Laxmi Bohra", flats: [flat("1073")] },
  { id: "96", name: "Jyoti Rajesh Katariya", flats: [flat("3203")] },
  { id: "97", name: "Sanjay Mehta", flats: [flat("1162")] },
  { id: "98", name: "Kalpesh Mehta", flats: [flat("1232")] },
  { id: "99", name: "Rishin Kiran Jain", flats: [flat("2041")] },
  { id: "100", name: "Rishik Kiran Jain", flats: [flat("2041")] },
  { id: "101", name: "Sunil Khusboo Mehta", flats: [flat("3125")] },
  { id: "102", name: "Tansukh Mahnot", flats: [flat("1043")] },
  { id: "103", name: "Gaurang Shah", flats: [flat("3162")] },
  { id: "104", name: "Naveen Deepti Ganna", flats: [flat("2226")] },
  { id: "105", name: "Manjula Ben Girish Parekh", flats: [flat("1161")] },
  { id: "106", name: "Smitha Sapani", flats: [flat("2074")] },
];

const IDS = new Set(FAMILIES.map((family) => family.id));

export function isFamilyId(id: string): boolean {
  return IDS.has(id);
}

export const TOWERS = [1, 2, 3, 4, 5] as const;

export function flatInTower(family: Family, tower: number): Flat | undefined {
  return family.flats.find((item) => item.tower === tower);
}

export function familiesForTower(tower: number): Family[] {
  return FAMILIES.filter((family) => family.flats.some((item) => item.tower === tower)).sort(
    (a, b) => {
      const af = flatInTower(a, tower) ?? a.flats[0];
      const bf = flatInTower(b, tower) ?? b.flats[0];
      const floor = (af?.floor ?? 99) - (bf?.floor ?? 99);
      if (floor !== 0) return floor;
      const house = (af?.house ?? 99) - (bf?.house ?? 99);
      if (house !== 0) return house;
      return a.name.localeCompare(b.name, "en");
    },
  );
}

export function unlistedFamilies(): Family[] {
  return FAMILIES.filter((family) => family.flats.length === 0);
}
