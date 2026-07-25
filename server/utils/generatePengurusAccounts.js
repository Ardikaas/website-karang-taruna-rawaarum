/* eslint-disable no-console */
const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const ExcelJS = require('exceljs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Pengurus = require('../models/Pengurus');

/**
 * Clean full name into a clean username without titles or special chars.
 * Example: "Ardika Aji Setiawan, S.Kom" -> "ardikaajisetiawan"
 * Example: "Imamul Hakim, S.AP" -> "imamulhakim"
 * Example: "Nila Nurmala Dewi, S.I.Kom" -> "nilanurmaladewi"
 */
const generateCleanUsername = (fullName) => {
  if (!fullName) return 'pengurus';

  // Remove academic titles like S.Kom, S.AP, S.HI, S.E, S.T, S.H, S.I.Kom, S.Sos, S.Pd, etc.
  let cleaned = fullName.split(',')[0]; // take part before comma
  cleaned = cleaned.replace(
    /\b(S\.AP|S\.HI|S\.E|S\.T|S\.H|S\.I\.Kom|S\.Sos|S\.Pd|S\.Kom|M\.Si)\b/gi,
    ''
  );
  // Remove all non-alphanumeric characters
  cleaned = cleaned.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  return cleaned || 'pengurus';
};

/**
 * Generate a random readable password (8 chars with letters & numbers)
 * Example: "Kartar2026#9k3p"
 */
const generateRandomPassword = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let randStr = '';
  for (let i = 0; i < 5; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Kartar2026#${randStr}`;
};

const runGenerator = async () => {
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/karangtaruna';
  console.log(`Connecting to MongoDB at: ${mongoUri}...`);

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.\n');

    const superUser = await User.findOne({ username: 'admin' });
    if (superUser) {
      await Pengurus.updateMany(
        { userId: superUser._id, name: { $ne: 'Super Admin' } },
        { $unset: { userId: 1 } }
      );
    }

    const allPengurus = await Pengurus.find().sort({ category: 1, level: 1 });
    console.log(`Found ${allPengurus.length} pengurus members in database.`);

    const generatedResults = [];

    for (const member of allPengurus) {
      const cleanUsername = generateCleanUsername(member.name);

      // Build query conditions dynamically to avoid matching undefined fields
      const orConditions = [{ username: cleanUsername }];
      if (member.userId) {
        orConditions.push({ _id: member.userId });
      }
      if (member.name) {
        orConditions.push({
          name: new RegExp(
            `^${member.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            'i'
          ),
        });
      }

      let existingUser = await User.findOne({ $or: orConditions });

      if (existingUser) {
        // Link userId if not linked yet
        if (!member.userId) {
          member.userId = existingUser._id;
          await member.save();
        }
        generatedResults.push({
          nama: member.name,
          role: member.role,
          username: existingUser.username,
          password: '(Sudah Ada Akun)',
          status: 'EKSISTING',
        });
      } else {
        // Create new account
        const tempPassword = generateRandomPassword();
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tempPassword, salt);

        const newUser = await User.create({
          username: cleanUsername,
          passwordHash,
          name: member.name,
          role: 'pengurus',
          imageUrl: member.imageUrl || '',
          socials: (member.socials || []).map((s) => ({
            platform: s.platform || 'Instagram',
            username: s.handle || '',
            url: s.url || '#',
          })),
        });

        // Link back to Pengurus document
        member.userId = newUser._id;
        await member.save();

        generatedResults.push({
          nama: member.name,
          role: member.role,
          username: cleanUsername,
          password: tempPassword,
          status: 'BARU DIBUAT',
        });
      }
    }

    console.log(
      '\n========================================================================================'
    );
    console.log(
      '                 HASIL GENERATE AKUN PENGURUS KARANG TARUNA RAWA ARUM'
    );
    console.log(
      '========================================================================================'
    );
    console.table(generatedResults);
    console.log(
      '========================================================================================'
    );
    console.log(
      `Total: ${generatedResults.length} akun pengurus berhasil disinkronkan.`
    );

    // ── Generate Beautiful Native Excel (.xlsx) Workbook ──
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Karang Taruna Rawa Arum';
    workbook.lastModifiedBy = 'Admin System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Akun Pengurus');

    // Title Header in Excel
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'DAFTAR AKUN PORTAL PENGURUS KARANG TARUNA RAWA ARUM';
    titleCell.font = {
      name: 'Calibri',
      size: 14,
      bold: true,
      color: { argb: '1E3A8A' },
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 32;

    // Define columns with custom widths
    worksheet.getRow(3).values = [
      'No',
      'Nama Pengurus',
      'Jabatan / Posisi',
      'Username Login',
      'Password Sementara',
      'Status Akun',
    ];
    worksheet.columns = [
      { key: 'no', width: 6 },
      { key: 'nama', width: 32 },
      { key: 'role', width: 30 },
      { key: 'username', width: 24 },
      { key: 'password', width: 24 },
      { key: 'status', width: 18 },
    ];

    // Style Table Header Row (Line 3)
    const headerRow = worksheet.getRow(3);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = {
        name: 'Calibri',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFF' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E3A8A' }, // Deep Navy Blue
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'medium', color: { argb: '1E3A8A' } },
        bottom: { style: 'medium', color: { argb: '1E3A8A' } },
      };
    });

    // Populate Data Rows with Zebra Styling & Borders
    generatedResults.forEach((r, idx) => {
      const row = worksheet.addRow({
        no: idx + 1,
        nama: r.nama,
        role: r.role,
        username: r.username,
        password: r.password,
        status: r.status,
      });

      row.height = 22;

      // Alignments
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
      row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' };

      // Typography
      row.getCell(2).font = {
        name: 'Calibri',
        size: 11,
        bold: true,
        color: { argb: '0F172A' },
      };
      row.getCell(4).font = {
        name: 'Consolas',
        size: 10,
        bold: true,
        color: { argb: '0284C7' },
      };
      row.getCell(5).font = {
        name: 'Consolas',
        size: 10,
        bold: true,
        color: { argb: r.status === 'BARU DIBUAT' ? '16A34A' : '64748B' },
      };
      row.getCell(6).font = {
        name: 'Calibri',
        size: 10,
        bold: true,
        color: { argb: r.status === 'BARU DIBUAT' ? '15803D' : '1E293B' },
      };

      // Zebra striping background for odd/even rows
      if (idx % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F8FAFC' },
          };
        });
      }

      // Thin borders around every cell
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } },
        };
      });
    });

    const xlsxPath = path.join(process.cwd(), 'akun_pengurus_generated.xlsx');
    await workbook.xlsx.writeFile(xlsxPath);
    console.log(
      `\n📊 Berkas Excel Rapi (.xlsx) berhasil dibuat di: ${xlsxPath}`
    );
    console.log(
      'Silakan buka berkas .xlsx tersebut langsung di Microsoft Excel.\n'
    );
  } catch (err) {
    console.error('Error generating accounts:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
};

// Execute if run directly via CLI (e.g. node utils/generatePengurusAccounts.js or docker exec)
if (require.main === module) {
  runGenerator();
}

module.exports = {
  generateCleanUsername,
  generateRandomPassword,
  runGenerator,
};
