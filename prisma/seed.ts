import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcrypt";
import { env } from "../src/env";

const prisma = new PrismaClient();

const profiles = [
  {
    name: "ADMIN",
    description:
      "Full administrative access to system settings and master data.",
  },
  {
    name: "SALES",
    description: "Commercial profile for accounts, quotes, and orders.",
  },
  {
    name: "FINANCE",
    description: "Financial profile for payment conditions and billing review.",
  },
  {
    name: "MANAGER",
    description:
      "Management profile for order approval and operational review.",
  },
  {
    name: "LOGISTICS",
    description: "Logistics profile for branches, storage, and inventory.",
  },
];

const orderStatuses = [
  "Draft",
  "Pending Approval",
  "Approved",
  "Rejected",
  "Processing",
  "Shipped",
  "Delivered",
  "Canceled",
];

async function upsertAddress(data: {
  name: string;
  street: string;
  neighborhood: string;
  number: string;
  postalCode: string;
  complement?: string;
}) {
  const existing = await prisma.address.findFirst({
    where: {
      name: data.name,
      street: data.street,
      number: data.number,
      postalCode: data.postalCode,
    },
  });

  if (existing) {
    return prisma.address.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.address.create({ data });
}

async function upsertPriceCatalog(data: { name: string; currency: string }) {
  const existing = await prisma.priceCatalog.findFirst({
    where: { name: data.name, currency: data.currency },
  });

  if (existing) {
    return prisma.priceCatalog.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.priceCatalog.create({ data });
}

async function upsertPaymentCondition(data: {
  paymentType: string;
  installments: number;
  currency: string;
  finalAmount: string;
  interest: string;
}) {
  const existing = await prisma.paymentCondition.findFirst({
    where: {
      paymentType: data.paymentType,
      installments: data.installments,
      currency: data.currency,
    },
  });

  if (existing) {
    return prisma.paymentCondition.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.paymentCondition.create({ data });
}

async function upsertContact(data: {
  officialName: string;
  nickname: string;
  accountId: string;
}) {
  const existing = await prisma.contact.findFirst({
    where: {
      officialName: data.officialName,
      accountId: data.accountId,
    },
  });

  if (existing) {
    return prisma.contact.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.contact.create({ data });
}

async function upsertQuote(data: {
  name: string;
  destination: string;
  finalValue: string;
  accountId: string;
}) {
  const existing = await prisma.quote.findFirst({
    where: {
      name: data.name,
      accountId: data.accountId,
    },
  });

  if (existing) {
    return prisma.quote.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.quote.create({ data });
}

async function upsertOrder(data: {
  name: string;
  origin: string;
  destination: string;
  finalValue: string;
  quoteId: string;
  statusId: string;
  priceCatalogId: string;
  paymentConditionId: string;
  shippingAddressId: string;
  paymentAddressId: string;
  approvalPolicyId: string;
  approvalRequestedByUserId: string;
  approvalStatus: "PENDING";
  approvalSubmittedAt: Date;
  approvalObservation: string;
}) {
  const existing = await prisma.order.findFirst({
    where: {
      name: data.name,
      quoteId: data.quoteId,
    },
  });

  if (existing) {
    return prisma.order.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.order.create({ data });
}

async function main() {
  const passwordHash = await bcrypt.hash(
    env.ADMIN_PASSWORD,
    env.PASSWORD_SALT_ROUNDS,
  );

  const profileByName = new Map<string, { id: string; name: string }>();

  for (const profile of profiles) {
    const record = await prisma.profile.upsert({
      where: { name: profile.name },
      update: { description: profile.description },
      create: profile,
    });

    profileByName.set(record.name, record);
  }

  for (const name of orderStatuses) {
    await prisma.status.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const pendingApprovalStatus = await prisma.status.findUniqueOrThrow({
    where: { name: "Pending Approval" },
  });

  const adminAddress = await upsertAddress({
    name: "Admin Home",
    street: "Av. Paulista",
    neighborhood: "Bela Vista",
    number: "1000",
    postalCode: "01310000",
    complement: "Seed address",
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@yescrm.local" },
    update: {
      name: "Admin",
      surname: "YES",
      username: "admin",
      govId: "00000000000000",
      password: passwordHash,
      phoneNumber: "+5511999999999",
      addressId: adminAddress.id,
    },
    create: {
      name: "Admin",
      surname: "YES",
      username: "admin",
      email: "admin@yescrm.local",
      bornDate: new Date("1990-01-01T00:00:00.000Z"),
      govId: "00000000000000",
      password: passwordHash,
      phoneNumber: "+5511999999999",
      addressId: adminAddress.id,
    },
  });

  for (const profile of profileByName.values()) {
    await prisma.userProfile.upsert({
      where: {
        userId_profileId: {
          userId: adminUser.id,
          profileId: profile.id,
        },
      },
      update: {
        isActive: true,
        revokedAt: null,
      },
      create: {
        userId: adminUser.id,
        profileId: profile.id,
      },
    });
  }

  const branchAddress = await upsertAddress({
    name: "YES Headquarters",
    street: "Rua das Industrias",
    neighborhood: "Distrito Industrial",
    number: "500",
    postalCode: "06454000",
    complement: "Warehouse and office",
  });

  const branch = await prisma.branch.upsert({
    where: { govId: "12345678000190" },
    update: {
      officialName: "YES CRM Matriz Ltda.",
      fantasyName: "YES Matriz",
      phoneNumber: "+551133333333",
      email: "matriz@yescrm.local",
      addressId: branchAddress.id,
    },
    create: {
      govId: "12345678000190",
      officialName: "YES CRM Matriz Ltda.",
      fantasyName: "YES Matriz",
      phoneNumber: "+551133333333",
      email: "matriz@yescrm.local",
      addressId: branchAddress.id,
    },
  });

  const logisticsContactAddress = await upsertAddress({
    name: "Client Dock",
    street: "Rua do Cliente",
    neighborhood: "Centro",
    number: "42",
    postalCode: "01001000",
    complement: "Receiving dock",
  });

  const account = await prisma.account.upsert({
    where: { govId: "98765432000110" },
    update: {
      officialName: "Cliente Exemplo S.A.",
      fantasyName: "Cliente Exemplo",
      phoneNumber: "+551144444444",
      email: "compras@cliente.local",
      ownerUserId: adminUser.id,
    },
    create: {
      govId: "98765432000110",
      officialName: "Cliente Exemplo S.A.",
      fantasyName: "Cliente Exemplo",
      phoneNumber: "+551144444444",
      email: "compras@cliente.local",
      ownerUserId: adminUser.id,
    },
  });

  const contact = await upsertContact({
    officialName: "Comprador Exemplo",
    nickname: "Compras",
    accountId: account.id,
  });

  await prisma.contactAddress.upsert({
    where: {
      contactId_addressId: {
        contactId: contact.id,
        addressId: logisticsContactAddress.id,
      },
    },
    update: {},
    create: {
      contactId: contact.id,
      addressId: logisticsContactAddress.id,
    },
  });

  const priceCatalog = await upsertPriceCatalog({
    name: "Default BRL Catalog",
    currency: "BRL",
  });

  const paymentCondition = await upsertPaymentCondition({
    paymentType: "Invoice",
    installments: 1,
    currency: "BRL",
    finalAmount: "1500.00",
    interest: "0.00",
  });

  const finishedProduct = await prisma.product.upsert({
    where: { productCode: "YES-001" },
    update: {
      name: "YES Starter Kit",
      nickname: "Starter Kit",
      provider: "YES CRM",
      basePrice: "1500.00",
      defaultCurrency: "BRL",
      ncm: "00000000",
      pictureUrl: "https://example.com/products/yes-starter-kit.png",
    },
    create: {
      name: "YES Starter Kit",
      nickname: "Starter Kit",
      provider: "YES CRM",
      basePrice: "1500.00",
      defaultCurrency: "BRL",
      ncm: "00000000",
      productCode: "YES-001",
      pictureUrl: "https://example.com/products/yes-starter-kit.png",
    },
  });

  const componentProduct = await prisma.product.upsert({
    where: { productCode: "YES-COMP-001" },
    update: {
      name: "YES Starter Component",
      nickname: "Component",
      provider: "YES CRM",
      basePrice: "250.00",
      defaultCurrency: "BRL",
      ncm: "00000000",
    },
    create: {
      name: "YES Starter Component",
      nickname: "Component",
      provider: "YES CRM",
      basePrice: "250.00",
      defaultCurrency: "BRL",
      ncm: "00000000",
      productCode: "YES-COMP-001",
    },
  });

  await prisma.priceCatalogProduct.upsert({
    where: {
      priceCatalogId_productId: {
        priceCatalogId: priceCatalog.id,
        productId: finishedProduct.id,
      },
    },
    update: { basePrice: "1500.00" },
    create: {
      priceCatalogId: priceCatalog.id,
      productId: finishedProduct.id,
      basePrice: "1500.00",
    },
  });

  const structure = await prisma.structure.upsert({
    where: { productId: finishedProduct.id },
    update: {},
    create: { productId: finishedProduct.id },
  });

  await prisma.structureProduct.upsert({
    where: {
      structureId_componentProductId: {
        structureId: structure.id,
        componentProductId: componentProduct.id,
      },
    },
    update: { quantity: "2.00" },
    create: {
      structureId: structure.id,
      componentProductId: componentProduct.id,
      quantity: "2.00",
    },
  });

  const storage = await prisma.storage.upsert({
    where: { storageCode: "MAIN-WH" },
    update: {
      name: "Main Warehouse",
      branchId: branch.id,
      logisticsContactId: contact.id,
    },
    create: {
      name: "Main Warehouse",
      storageCode: "MAIN-WH",
      branchId: branch.id,
      logisticsContactId: contact.id,
    },
  });

  await prisma.storageProduct.upsert({
    where: {
      storageId_productId: {
        storageId: storage.id,
        productId: finishedProduct.id,
      },
    },
    update: {
      availableQuantity: "10.00",
      committedQuantity: "1.00",
      totalQuantity: "11.00",
    },
    create: {
      storageId: storage.id,
      productId: finishedProduct.id,
      availableQuantity: "10.00",
      committedQuantity: "1.00",
      totalQuantity: "11.00",
    },
  });

  const quote = await upsertQuote({
    name: "Sample Quote",
    destination: "Cliente Exemplo",
    finalValue: "1500.00",
    accountId: account.id,
  });

  await prisma.quoteProduct.upsert({
    where: {
      quoteId_productId: {
        quoteId: quote.id,
        productId: finishedProduct.id,
      },
    },
    update: {
      quantity: "1.00",
      price: "1500.00",
      discount: "0.00",
      finalPrice: "1500.00",
    },
    create: {
      quoteId: quote.id,
      productId: finishedProduct.id,
      quantity: "1.00",
      price: "1500.00",
      discount: "0.00",
      finalPrice: "1500.00",
    },
  });

  const approvalPolicy = await prisma.approvalPolicy.upsert({
    where: { name: "Default Order Approval" },
    update: {
      description: "Default two-step approval flow for BRL orders.",
      isActive: true,
      minOrderValue: "1000.00",
      maxOrderValue: null,
      currency: "BRL",
    },
    create: {
      name: "Default Order Approval",
      description: "Default two-step approval flow for BRL orders.",
      isActive: true,
      minOrderValue: "1000.00",
      currency: "BRL",
    },
  });

  const managerStep = await prisma.approvalStep.upsert({
    where: {
      policyId_sequence: {
        policyId: approvalPolicy.id,
        sequence: 1,
      },
    },
    update: {
      name: "Manager Review",
      description: "Management approval for commercial conditions.",
      requiredApprovals: 1,
      isFinalStep: false,
    },
    create: {
      policyId: approvalPolicy.id,
      sequence: 1,
      name: "Manager Review",
      description: "Management approval for commercial conditions.",
      requiredApprovals: 1,
    },
  });

  const financeStep = await prisma.approvalStep.upsert({
    where: {
      policyId_sequence: {
        policyId: approvalPolicy.id,
        sequence: 2,
      },
    },
    update: {
      name: "Finance Review",
      description: "Financial approval for billing and payment terms.",
      requiredApprovals: 1,
      isFinalStep: true,
    },
    create: {
      policyId: approvalPolicy.id,
      sequence: 2,
      name: "Finance Review",
      description: "Financial approval for billing and payment terms.",
      requiredApprovals: 1,
      isFinalStep: true,
    },
  });

  const managerProfile = profileByName.get("MANAGER");
  const financeProfile = profileByName.get("FINANCE");

  if (!managerProfile || !financeProfile) {
    throw new Error("Required approval profiles were not created.");
  }

  await prisma.approvalStepProfile.upsert({
    where: {
      approvalStepId_profileId: {
        approvalStepId: managerStep.id,
        profileId: managerProfile.id,
      },
    },
    update: {},
    create: {
      approvalStepId: managerStep.id,
      profileId: managerProfile.id,
    },
  });

  await prisma.approvalStepProfile.upsert({
    where: {
      approvalStepId_profileId: {
        approvalStepId: financeStep.id,
        profileId: financeProfile.id,
      },
    },
    update: {},
    create: {
      approvalStepId: financeStep.id,
      profileId: financeProfile.id,
    },
  });

  const order = await upsertOrder({
    name: "Sample Order",
    origin: "YES Headquarters",
    destination: "Cliente Exemplo",
    finalValue: "1500.00",
    quoteId: quote.id,
    statusId: pendingApprovalStatus.id,
    priceCatalogId: priceCatalog.id,
    paymentConditionId: paymentCondition.id,
    shippingAddressId: logisticsContactAddress.id,
    paymentAddressId: logisticsContactAddress.id,
    approvalPolicyId: approvalPolicy.id,
    approvalRequestedByUserId: adminUser.id,
    approvalStatus: "PENDING",
    approvalSubmittedAt: new Date(),
    approvalObservation: "Sample order created by seed.",
  });

  for (const step of [managerStep, financeStep]) {
    await prisma.orderApproval.upsert({
      where: {
        orderId_approvalStepId: {
          orderId: order.id,
          approvalStepId: step.id,
        },
      },
      update: {
        status: "PENDING",
        observation: null,
        resolvedAt: null,
      },
      create: {
        orderId: order.id,
        approvalStepId: step.id,
      },
    });
  }

  console.info("Seed completed successfully.");
  console.info("Admin user: admin@yescrm.local / username: admin");
  console.info("Admin password loaded from ADMIN_PASSWORD.");
}

main()
  .catch((error) => {
    console.error("Seed failed.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
