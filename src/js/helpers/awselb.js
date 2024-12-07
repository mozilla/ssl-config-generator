export default (form, output) => {
    var attributes = '';
    for (let x of output.protocols) {
      attributes +=
`            - Name: Protocol-${x}
              Value: true
`;
    }

    attributes +=
`            - Name: Server-Defined-Cipher-Order
              Value: ${output.serverPreferredOrder ? "true" : "false"}
`;

    if (output.ciphers.length) {
     for (let x of output.ciphers) {
      attributes +=
`            - Name: ${x}
              Value: true
`;
     }
    }

    var conf =
`AWSTemplateFormatVersion: 2010-09-09
Description: Mozilla ELB configuration generated ${output.date}, ${output.link}
Parameters:
  SSLCertificateId:
    Description: The ARN of the ACM SSL certificate to use
    Type: String
    AllowedPattern: ^arn:aws:acm:[^:]*:[^:]*:certificate/.*$
    ConstraintDescription: >
      SSL Certificate ID must be a valid ACM ARN.
      https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html#genref-arns
Resources:
  ExampleELB:
    Type: AWS::ElasticLoadBalancing::LoadBalancer
    Properties:
      Listeners:
        - LoadBalancerPort: '443'
          InstancePort: '80'
          PolicyNames:
            - Mozilla-${form.config}-v5-0
          SSLCertificateId: !Ref SSLCertificateId
          Protocol: HTTPS
      AvailabilityZones:
        Fn::GetAZs: !Ref 'AWS::Region'
      Policies:
        - PolicyName: Mozilla-$form.config}-v5-0
          PolicyType: SSLNegotiationPolicyType
          Attributes:
${attributes}
Outputs:
  ELBURL:
    Description: URL of the ELB load balancer
    Value: !Join [ '', [ 'https://', !GetAtt 'ExampleELB.DNSName', '/' ] ]
`;

  return conf;
};
