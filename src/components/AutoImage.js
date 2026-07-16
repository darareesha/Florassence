import React from 'react';
import { Image } from 'react-native';

export default function AutoImage({ source, style, ...props }) {
  const { width, height } = Image.resolveAssetSource(source);
  const aspectRatio = width / height;
  return <Image source={source} style={[{ width: '100%', aspectRatio }, style]} {...props} />;
}


/*
 AutoImage is a reusable wrapper around React Native's Image component.
 It automatically reads the original dimensions of a local image using
 Image.resolveAssetSource(), calculates its aspect ratio using the formula (width ÷ height),
 and applies it to the Image. By setting the width to 100% and using the
 calculated aspect ratio. React Native automatically determines the correct
 height, ensuring the image scales responsively without becoming stretched
 or distorted
  */