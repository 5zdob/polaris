import {
  CaretDownMinor,
  EditMajor,
  SelectMinor,
  SearchMinor,
  PlusMinor,
} from '@shopify/polaris-icons';
import React from 'react';

import {
  ButtonNew,
  AlphaCard,
  VerticalStack,
  Bleed,
  Box,
  ButtonBase,
  Icon,
  HorizontalStack,
  Page,
  Text,
} from '../src';

export function Playground() {
  return (
    <Page title="Playground" narrowWidth>
      <VerticalStack gap="12">
        <VerticalStack gap="2">
          <Text variant="headingMd" as="h2">
            Button base
          </Text>
          <Box border="base" padding="4" borderRadius="2" background="bg">
            <HorizontalStack gap="2" blockAlign="start">
              <ButtonBase>Button Base</ButtonBase>
              <ButtonBase as="a" to="#">
                Button Base Link
              </ButtonBase>
              <ButtonBase>
                <Icon source={EditMajor} color="base" />
              </ButtonBase>
            </HorizontalStack>
          </Box>
        </VerticalStack>

        <VerticalStack gap="2">
          <Text variant="headingMd" as="h2">
            Variants
          </Text>
          <Box border="base" padding="4" borderRadius="2" background="bg">
            <HorizontalStack gap="2" blockAlign="start">
              <ButtonNew variant="secondary">Secondary</ButtonNew>
              <ButtonNew variant="primary">Primary</ButtonNew>
              <ButtonNew variant="transparent">Transparent</ButtonNew>
            </HorizontalStack>
          </Box>
        </VerticalStack>

        <VerticalStack gap="2">
          <VerticalStack>
            <Text variant="headingMd" as="h2">
              Sizes
            </Text>
            <Text as="p">
              You can adjust the size of the button using the size prop, which
              accepts three different sizes: `small`, `medium`, `large`.
            </Text>
          </VerticalStack>
          <Box border="base" padding="4" borderRadius="2" background="bg">
            <HorizontalStack gap="2" blockAlign="start">
              <ButtonNew variant="secondary" size="small">
                Small
              </ButtonNew>
              <ButtonNew variant="secondary">Medium</ButtonNew>
              <ButtonNew variant="secondary" size="large">
                Large
              </ButtonNew>
            </HorizontalStack>
          </Box>
        </VerticalStack>

        <VerticalStack gap="2">
          <Text variant="headingMd" as="h2">
            With icon
          </Text>
          <Box border="base" padding="4" borderRadius="2" background="bg">
            <HorizontalStack gap="2" blockAlign="start">
              <ButtonNew>
                <HorizontalStack gap="1" blockAlign="center">
                  <Icon source={PlusMinor} color="base" />
                  Add variant
                </HorizontalStack>
              </ButtonNew>
              <ButtonNew>
                <HorizontalStack blockAlign="center">
                  Edit
                  <Icon source={CaretDownMinor} color="base" />
                </HorizontalStack>
              </ButtonNew>
              <ButtonNew>
                <HorizontalStack blockAlign="center">
                  Location
                  <Icon source={SelectMinor} color="base" />
                </HorizontalStack>
              </ButtonNew>
            </HorizontalStack>
          </Box>
        </VerticalStack>

        <VerticalStack gap="2">
          <Text variant="headingMd" as="h2">
            Icon only
          </Text>
          <Box border="base" padding="4" borderRadius="2" background="bg">
            <HorizontalStack gap="2" blockAlign="start">
              <ButtonNew size="small">
                <HorizontalStack gap="1" blockAlign="center">
                  <Icon source={SearchMinor} color="base" />
                </HorizontalStack>
              </ButtonNew>
              <ButtonNew>
                <HorizontalStack blockAlign="center">
                  <Icon source={SearchMinor} color="base" />
                </HorizontalStack>
              </ButtonNew>
              <ButtonNew size="large">
                <HorizontalStack blockAlign="center">
                  <Icon source={SearchMinor} color="base" />
                </HorizontalStack>
              </ButtonNew>
            </HorizontalStack>
          </Box>
        </VerticalStack>

        <VerticalStack gap="2">
          <Text variant="headingMd" as="h2">
            Fullwidth button
          </Text>
          <Box border="base" padding="4" borderRadius="2" background="bg">
            <VerticalStack gap="4">
              <ButtonNew>Full width button</ButtonNew>
            </VerticalStack>
          </Box>
        </VerticalStack>

        <VerticalStack gap="2">
          <VerticalStack>
            <Text variant="headingMd" as="h2">
              Critical actions
            </Text>
            <Text as="p">
              For destructive actions like “Delete” you can set the button’s
              tone to critical.
            </Text>
          </VerticalStack>
          <Box border="base" padding="4" borderRadius="2" background="bg">
            <HorizontalStack gap="2" blockAlign="start">
              <ButtonNew variant="secondary" tone="critical">
                Secondary
              </ButtonNew>
              <ButtonNew variant="primary" tone="critical">
                Primary
              </ButtonNew>
              <ButtonNew variant="transparent" tone="critical">
                Transparent
              </ButtonNew>
            </HorizontalStack>
          </Box>
        </VerticalStack>

        <VerticalStack gap="6">
          <VerticalStack>
            <Text variant="headingMd" as="h2">
              Background colors
            </Text>
            <Text as="p">
              Buttons on different background colors: `bg`, `bg-subdued`, and
              `bg-inverse`
            </Text>
          </VerticalStack>

          <VerticalStack gap="1">
            <Text as="h3" variant="headingSm">
              Default background
            </Text>
            <Box border="base" padding="4" borderRadius="2" background="bg">
              <HorizontalStack gap="2" blockAlign="start">
                <ButtonNew variant="secondary">Secondary</ButtonNew>
                <ButtonNew variant="primary">Primary</ButtonNew>
                <ButtonNew variant="transparent">Transparent</ButtonNew>
              </HorizontalStack>
            </Box>
          </VerticalStack>

          <VerticalStack gap="1">
            <Text as="h3" variant="headingSm">
              Subdued background
            </Text>
            <Box
              border="base"
              padding="4"
              borderRadius="2"
              background="bg-subdued"
            >
              <HorizontalStack gap="2" blockAlign="start">
                <ButtonNew variant="secondary">Secondary</ButtonNew>
                <ButtonNew variant="primary">Primary</ButtonNew>
                <ButtonNew variant="transparent">Transparent</ButtonNew>
              </HorizontalStack>
            </Box>
          </VerticalStack>

          <VerticalStack gap="1">
            <Text as="h3" variant="headingSm">
              Inverse background
            </Text>
            <Box
              border="base"
              padding="4"
              borderRadius="2"
              background="bg-inverse"
            >
              <HorizontalStack gap="2" blockAlign="start">
                <ButtonNew>Secondary</ButtonNew>
                <ButtonNew disabled>Secondary</ButtonNew>
                <ButtonNew tone="critical">Secondary</ButtonNew>
                <ButtonNew tone="critical" disabled>
                  Secondary
                </ButtonNew>
                <ButtonNew variant="transparent">Transparent</ButtonNew>
                <ButtonNew variant="transparent" disabled>
                  Transparent
                </ButtonNew>
                <ButtonNew variant="primary">Primary</ButtonNew>
                <ButtonNew variant="primary" disabled>
                  Primary
                </ButtonNew>
              </HorizontalStack>
            </Box>
          </VerticalStack>
        </VerticalStack>
      </VerticalStack>
    </Page>
  );
}
